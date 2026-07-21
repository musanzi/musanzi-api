import { Command } from '@nestjs/cqrs';

export class DeleteProject extends Command<void> {
  constructor(public readonly id: string) {
    super();
  }
}
