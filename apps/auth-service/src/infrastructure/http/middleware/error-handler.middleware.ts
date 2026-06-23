import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from '../../../domain/exceptions/domain.exception';

@Catch()
export class ErrorHandlerFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Ocurrió un error inesperado en el servidor.';
    let code = 'INTERNAL_SERVER_ERROR';

    // 1. Si el error proviene controladamente del Dominio (Reglas de negocio)
    if (exception instanceof DomainException) {
      status = HttpStatus.BAD_REQUEST; // O 409 Conflict dependiendo del mensaje
      message = exception.message;
      code = 'DOMAIN_BUSINESS_RULE_VIOLATION';
    } 
    // 2. Si es un error propio del framework HTTP (ej: fallos de class-validator)
    else if (exception instanceof HttpException) {
      const httpError = exception as HttpException;
      status = httpError.getStatus();
      const resResponse = httpError.getResponse() as any;
      message = resResponse.message || httpError.message;
      code = 'HTTP_TRANSPORT_ERROR';
    } 
    // 3. Errores críticos no controlados (Prisma, caídas de red, etc.)
    else {
      // Registramos el error real internamente en la consola o sistema de logs (Winston/Datadog)
      console.error('💥 [CRITICAL ERROR]:', exception);
    }

    // Respuesta estructurada profesional bajo el estándar RFC 7807
    response.status(status).json({
      type: `https://api.tuservicio.com/errors/${code.toLowerCase()}`,
      title: code.replace(/_/g, ' '),
      status: status,
      detail: message,
      instance: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}