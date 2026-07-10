export enum CampfireVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export enum CampfireStatus {
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  ARCHIVED = 'ARCHIVED',
}

export enum CampfireMood {
  STORYTELLING = 'STORYTELLING',
  DEEP_DISCUSSION = 'DEEP_DISCUSSION',
  LEARNING = 'LEARNING',
  CASUAL = 'CASUAL',
  ADVENTURE = 'ADVENTURE',
  TRAVEL = 'TRAVEL',
}

export enum CampfireCategory {
  ADVENTURE = 'ADVENTURE',
  FOOD = 'FOOD',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  STORYTELLING = 'STORYTELLING',
  TRAVEL = 'TRAVEL',
  LEARNING = 'LEARNING',
}

export const CAMPFIRE_ERROR_MESSAGES = {
  NOT_FOUND: 'Campfire not found',
  ALREADY_STARTED: 'Campfire has already started',
  ALREADY_ENDED: 'Campfire has already ended',
  CAPACITY_REACHED: 'Campfire is full',
  SPEAKER_LIMIT_REACHED: 'Speaker limit reached',
  UNAUTHORIZED: 'You do not have permission to perform this action',
};
