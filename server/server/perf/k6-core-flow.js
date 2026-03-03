import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const http4xxRate = new Rate("http_4xx_rate");
export const http5xxRate = new Rate("http_5xx_rate");

export const options = {
  scenarios: {
    health: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "10s", target: 5 },
        { duration: "20s", target: 15 },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.01"],
    http_5xx_rate: ["rate<0.02"],

  },
};

const BASE = __ENV.BASE_URL || "http://localhost:3000";

function trackStatus(res) {
  http4xxRate.add(res.status >= 400 && res.status < 500);
  http5xxRate.add(res.status >= 500);
}

function ok(res, name, expected = [200]) {
  trackStatus(res);
  const pass = expected.includes(res.status);
  check(res, { [name]: () => pass });
  if (!pass) {
    console.error(`${name} FAIL status=${res.status} url=${res.url} body=${res.body}`);
  }
  return pass;
}

function login(tipo, fone, senha) {
  const res = http.post(
    `${BASE}/auth/login`,
    JSON.stringify({ tipo, fone, senha }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "POST /auth/login" },
    }
  );

  if (!ok(res, "login 200/201", [200, 201])) return null;
  return res.json()?.accessToken || null;
}

// Datas válidas (não domingo/segunda) - usado só para consultas de disponibilidade
function nextValidDateYYYYMMDD() {
  const d = new Date();
  for (let i = 0; i < 14; i++) {
    d.setDate(d.getDate() + 1);
    const wd = d.getDay(); // 0=dom, 1=seg
    if (wd !== 0 && wd !== 1) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }
  }
  return "2026-02-26";
}

function pickAvailableDate(diasJson) {
  if (!Array.isArray(diasJson)) return null;
  const candidates = diasJson
    .filter((d) => d && d.available === true)
    .map((d) => d.date || d.data || d.dia || d.day)
    .filter((x) => typeof x === "string" && x.length >= 10)
    .map((s) => s.slice(0, 10));
  return candidates.length ? candidates[0] : null;
}

export default function () {
  // Login como CLIENTE para validar guard + JWT e permitir /me
  const token = login("cliente", "+5551999999999", "123456");
  if (!token) {
    sleep(1);
    return;
  }

  const auth = {
    headers: { Authorization: `Bearer ${token}` },
  };

  // 1) Listar serviços
  const servRes = http.get(`${BASE}/agendamentos/servicos`, {
    ...auth,
    tags: { name: "GET /agendamentos/servicos" },
  });
  if (!ok(servRes, "servicos 200", [200])) {
    sleep(1);
    return;
  }

  const servicos = servRes.json();
  const servicoId = Array.isArray(servicos) && servicos.length ? servicos[0].id : 1;

  // 2) Dias (usa mes=YYYY-MM)
  const mes = "2026-02";
  const diasRes = http.get(
    `${BASE}/agendamentos/disponibilidade/dias?servicoId=${servicoId}&mes=${encodeURIComponent(mes)}`,
    {
      ...auth,
      tags: { name: "GET /agendamentos/disponibilidade/dias" },
    }
  );
  if (!ok(diasRes, "dias 200", [200])) {
    sleep(1);
    return;
  }

  const dias = diasRes.json();
  let data = pickAvailableDate(dias);
  if (!data) data = nextValidDateYYYYMMDD();

  // 3) Horários
  const horariosRes = http.get(
    `${BASE}/agendamentos/disponibilidade/horarios?servicoId=${servicoId}&data=${encodeURIComponent(data)}`,
    {
      ...auth,
      tags: { name: "GET /agendamentos/disponibilidade/horarios" },
    }
  );
  ok(horariosRes, "horarios 200", [200]);

  // 4) Meus agendamentos (autenticado)
  const meRes = http.get(`${BASE}/agendamentos/me`, {
    ...auth,
    tags: { name: "GET /agendamentos/me" },
  });
  ok(meRes, "meus 200", [200]);

  sleep(1);
}