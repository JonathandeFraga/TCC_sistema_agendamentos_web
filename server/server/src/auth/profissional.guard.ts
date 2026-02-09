import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class ProfissionalGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        if (req.user?.tipo !== 'profissional') throw new ForbiddenException('Apenas profissional.');
        return true;
    }
}