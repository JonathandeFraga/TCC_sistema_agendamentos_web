import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class ClienteGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): boolean {
        const req = ctx.switchToHttp().getRequest();
        if (req.user?.tipo !== 'cliente') throw new ForbiddenException('Apenas cliente.');
        return true;
    }
}