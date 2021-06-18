import { Subjects, Publisher, ExpirationCompleteEvent } from '@kxt5258/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
