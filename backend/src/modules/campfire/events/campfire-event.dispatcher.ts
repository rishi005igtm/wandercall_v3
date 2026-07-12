import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampfireEntity } from '../entities/campfire.entity';

export enum CampfireEvents {
  CREATED = 'campfire.created',
  UPDATED = 'campfire.updated',
  DELETED = 'campfire.deleted',
  STARTED = 'campfire.started',
  ENDED = 'campfire.ended',
  RESTARTED = 'campfire.restarted',
  PARTICIPANT_JOINED = 'campfire.participant.joined',
  PARTICIPANT_LEFT = 'campfire.participant.left',
}

export interface CampfireParticipantEventPayload {
  campfireId: string;
  userId: string;
  displayName: string;
  avatar: string;
  role: string;
  action: 'JOINED' | 'LEFT';
  timestamp: string;
}

@Injectable()
export class CampfireEventDispatcher {
  private readonly logger = new Logger(CampfireEventDispatcher.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  emitCreated(campfire: CampfireEntity) {
    this.logger.debug(`Emitting CREATED for campfire ${campfire.id}`);
    this.eventEmitter.emit(CampfireEvents.CREATED, campfire);
  }

  emitUpdated(campfire: CampfireEntity) {
    this.logger.debug(`Emitting UPDATED for campfire ${campfire.id}`);
    this.eventEmitter.emit(CampfireEvents.UPDATED, campfire);
  }

  emitDeleted(campfireId: string) {
    this.logger.debug(`Emitting DELETED for campfire ${campfireId}`);
    this.eventEmitter.emit(CampfireEvents.DELETED, { id: campfireId });
  }

  emitStarted(campfire: CampfireEntity) {
    this.logger.debug(`Emitting STARTED for campfire ${campfire.id}`);
    this.eventEmitter.emit(CampfireEvents.STARTED, campfire);
  }

  emitEnded(campfire: CampfireEntity) {
    this.logger.debug(`Emitting ENDED for campfire ${campfire.id}`);
    this.eventEmitter.emit(CampfireEvents.ENDED, campfire);
  }

  emitRestarted(campfire: CampfireEntity) {
    this.logger.debug(`Emitting RESTARTED for campfire ${campfire.id}`);
    this.eventEmitter.emit(CampfireEvents.RESTARTED, campfire);
  }

  emitParticipantJoined(payload: CampfireParticipantEventPayload) {
    this.logger.debug(`Emitting PARTICIPANT_JOINED for user ${payload.userId} in room ${payload.campfireId}`);
    this.eventEmitter.emit(CampfireEvents.PARTICIPANT_JOINED, payload);
  }

  emitParticipantLeft(payload: CampfireParticipantEventPayload) {
    this.logger.debug(`Emitting PARTICIPANT_LEFT for user ${payload.userId} in room ${payload.campfireId}`);
    this.eventEmitter.emit(CampfireEvents.PARTICIPANT_LEFT, payload);
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.eventEmitter.on(event, callback);
  }
}
