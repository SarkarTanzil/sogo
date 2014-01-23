/*

Copyright (c) 2014, Inverse inc.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the Inverse inc. nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

*/
#import "iCalToDo+ActiveSync.h"

#import <Foundation/NSCalendarDate.h>
#import <Foundation/NSDate.h>
#import <Foundation/NSDictionary.h>
#import <Foundation/NSString.h>
#import <Foundation/NSTimeZone.h>

#import <NGCards/iCalCalendar.h>
#import <NGCards/iCalDateTime.h>
#import <NGCards/iCalTimeZone.h>

#include "NSDate+ActiveSync.h"
#include "NSString+ActiveSync.h"

@implementation iCalToDo (ActiveSync)

- (NSString *) activeSyncRepresentation
{
  NSMutableString *s;
  int v;

  s = [NSMutableString string];

  // Complete
  NSCalendarDate *completed;
  completed = [self completed];
  [s appendFormat: @"<Complete xmlns=\"Tasks:\">%d</Complete>", (completed ? 1 : 0)];
  
  // DateCompleted
  if (completed)
    [s appendFormat: @"<DateCompleted xmlns=\"Tasks:\">%@</DateCompleted>", [completed activeSyncRepresentation]];
  
  // Due date
  NSCalendarDate *due;
  due = [self due];
  if (due)
    [s appendFormat: @"<DueDate xmlns=\"Tasks:\">%@</DueDate>", [due activeSyncRepresentation]];
  
  // Importance
  NSString *priority;
  priority = [self priority];
  if ([priority isEqualToString: @"9"])
    v = 0;
  else if ([priority isEqualToString: @"1"])
    v = 2;
  else
    v = 1;
  [s appendFormat: @"<Importance xmlns=\"Tasks:\">%d</Importance>", v];
                    
  // Reminder - FIXME
  [s appendFormat: @"<ReminderSet xmlns=\"Tasks:\">%d</ReminderSet>", 0];
  
  // Sensitivity - FIXME
  [s appendFormat: @"<Sensitivity xmlns=\"Tasks:\">%d</Sensitivity>", 0];
  
  // UTCStartDate - FIXME
  if ([self startDate])
    [s appendFormat: @"<UTCStartDate xmlns=\"Tasks:\">%@</UTCStartDate>", [[self startDate] activeSyncRepresentation]];
  
  // Subject
  [s appendFormat: @"<Subject xmlns=\"Tasks:\">%@</Subject>", [self summary]];

  return s;
}

- (void) takeActiveSyncValues: (NSDictionary *) theValues
{
  NSTimeZone *userTimeZone;
  iCalTimeZone *tz;
  id o;

  NSInteger tzOffset;

  userTimeZone = [theValues objectForKey: @"SOGoUserTimeZone"];
  tz = [iCalTimeZone timeZoneForName: [userTimeZone name]];
  [(iCalCalendar *) parent addTimeZone: tz];
  
  // FIXME: merge with iCalEvent
  if ((o = [theValues objectForKey: @"Subject"]))
    [self setSummary: o];

  // FIXME: merge with iCalEvent
  if ((o = [[theValues objectForKey: @"Body"] objectForKey: @"Data"]))
    [self setComment: o];
  
  
  if ([[theValues objectForKey: @"Complete"] intValue] &&
      ((o = [theValues objectForKey: @"DateCompleted"])) )
    {
      iCalDateTime *completed;
      
      o = [o calendarDate];
      completed = (iCalDateTime *) [self uniqueChildWithTag: @"completed"];
      //tzOffset = [[o timeZone] secondsFromGMTForDate: o];
      //o = [o dateByAddingYears: 0 months: 0 days: 0
      //                   hours: 0 minutes: 0
      //                 seconds: -tzOffset];
      [completed setDate: o];
      [self setStatus: @"COMPLETED"];
    }

  if ((o = [theValues objectForKey: @"DueDate"]))
    {
      iCalDateTime *due;
     

      o = [o calendarDate];
      due = (iCalDateTime *) [self uniqueChildWithTag: @"due"];
      [due setTimeZone: tz];
      
      tzOffset = [userTimeZone secondsFromGMTForDate: o];
      o = [o dateByAddingYears: 0 months: 0 days: 0
                         hours: 0 minutes: 0
                       seconds: tzOffset];
      [due setDateTime: o];
    }

  // 2 == high, 1 == normal, 0 == low
  if ((o = [theValues objectForKey: @"Importance"]))
    {
      if ([o intValue] == 2)
        [self setPriority: @"1"];
      else if ([o intValue] == 1)
        [self setPriority: @"5"];
      else
        [self setPriority: @"9"];
    }


  if ((o = [theValues objectForKey: @"ReminderTime"]))
    {

    }
}

@end