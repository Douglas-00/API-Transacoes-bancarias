import { Injectable, Logger, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger extends Logger implements LoggerService {
  log(message: string) {
    super.log(message);
  }

  error(message: string) {
    super.error(message);
  }

  warn(message: string) {
    super.warn(message);
  }

  debug(message: string) {
    super.debug(message);
  }

  verbose(message: string) {
    super.verbose(message);
  }
}
