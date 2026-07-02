import { UpdateTagDto } from '../../dto';

export class UpdateTagCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateTagDto
  ) {}
}
