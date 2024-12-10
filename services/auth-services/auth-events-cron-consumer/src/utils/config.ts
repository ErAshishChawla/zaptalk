import {
  convertSecondsToTimeObject,
  createJobSchedule,
  EventQueue,
  EventQueueConfig,
  getJobDescription,
} from "@eraczaptalk/zaptalk-common";

const jobConfig = EventQueueConfig[EventQueue.authQueue];

const jobIntervalSec =
  (jobConfig.eventTimeoutMs + jobConfig.cronJobBufferMs) / 1000;

const timeObject = convertSecondsToTimeObject(jobIntervalSec);
const jobDescription = getJobDescription(timeObject);
const jobSchedule = createJobSchedule(timeObject);

export { jobDescription, jobSchedule, jobConfig };
