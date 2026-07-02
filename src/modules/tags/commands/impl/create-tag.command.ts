import { CreateTagDto } from '../../dto';

export class CreateTagCommand {
  constructor(public readonly dto: CreateTagDto) {}
}
