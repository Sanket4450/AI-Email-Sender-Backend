import { Injectable, PipeTransform } from '@nestjs/common';
import { removeWhiteSpace } from '../utils/common.utils';

@Injectable()
export class SanitizeInputPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeInput(value);
    }
    return value;
  }

  private sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return removeWhiteSpace(input);
    } else if (Array.isArray(input)) {
      return input.map((item) =>
        typeof item === 'string' ? this.sanitizeInput(item) : item,
      );
    } else if (typeof input === 'object' && input !== null) {
      return Object.fromEntries(
        Object.entries(input).map(([key, value]) => [
          key,
          this.sanitizeInput(value),
        ]),
      );
    }
    return input;
  }
}
