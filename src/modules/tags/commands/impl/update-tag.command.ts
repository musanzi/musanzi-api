import { UpdateTagDto } from '../../dto';

export class UpdateTag {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateTagDto
  ) {}
}
