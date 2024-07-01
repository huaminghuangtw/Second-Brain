---
dg-publish: true
---
- `launchd` and `cron` jobs
	- If your machine is in sleep mode [^1]:
		- `cron` jobs will not execute; they will not run until the next designated time occurs.
		- `launchd` jobs will execute when the computer wakes up (by setting the `StartCalendarInterval` key).

[^1]: https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/BPSystemStartup/Chapters/ScheduledJobs.html