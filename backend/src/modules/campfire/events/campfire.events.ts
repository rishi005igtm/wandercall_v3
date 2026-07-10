import { CampfireEntity } from '../entities/campfire.entity';

export class CampfireCreatedEvent {
  constructor(public readonly campfire: CampfireEntity) {}
}

export class CampfireUpdatedEvent {
  constructor(public readonly campfire: CampfireEntity) {}
}

export class CampfireDeletedEvent {
  constructor(
    public readonly campfireId: string,
    public readonly communityId: string,
  ) {}
}

export class CampfireStartedEvent {
  constructor(public readonly campfire: CampfireEntity) {}
}

export class CampfireClosedEvent {
  constructor(public readonly campfire: CampfireEntity) {}
}
