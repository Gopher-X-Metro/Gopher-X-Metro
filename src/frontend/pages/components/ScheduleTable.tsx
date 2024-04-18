import React, { useState, useEffect } from 'react';
import Schedule from './Schedule.tsx';

  //Error with selectedSchedule State
  export default function ScheduleTable({selectedSchedule}){
    
    const [selectedName, setSelectedName] = useState('121 Campus Connector');
    const [scheduleTimes, setScheduleTimes] = useState([
      ["Monday-Friday", "7:00 am – 7:30 am", "every 10 minutes"],
      ["Monday-Friday", "7:30 am – 6:30 pm", "every 5 minutes"],
      ["Monday-Friday", "6:30 pm – 10:00 pm", "every 15 minutes"],
      ["Monday-Wednesday", "10:00 pm – 12:15 am", "every 20 minutes"],
      ["Thursday-Friday", "10:00 pm – 2:00 am", "every 20 minutes"],
      ["Saturday", "9:30 am – 2:00 am", "every 20 minutes"],
      ["Sunday", "9:30 am – 12:15 am", "every 20 minutes"],
    ]);


    useEffect(() => {
      switch (selectedSchedule) {
        case 121:
          setSelectedName('121 Campus Connector');
          setScheduleTimes([
            ["Monday-Friday", "7:00 am – 7:30 am", "every 10 minutes"],
            ["Monday-Friday", "7:30 am – 6:30 pm", "every 5 minutes"],
            ["Monday-Friday", "6:30 pm – 10:00 pm", "every 15 minutes"],
            ["Monday-Wednesday", "10:00 pm – 12:15 am", "every 20 minutes"],
            ["Thursday-Friday", "10:00 pm – 2:00 am", "every 20 minutes"],
            ["Saturday", "9:30 am – 2:00 am", "every 20 minutes"],
            ["Sunday", "9:30 am – 12:15 am", "every 20 minutes"],
          ]);
          break;
        case 122:
          setSelectedName('122 University Avenue Circulator');
          setScheduleTimes([
            ["Monday-Friday", "7:00 am – 6:30 pm", "every 10 minutes"],
            ["Monday-Wednesday", "6:30 pm – 12:15 am", "every 15 minutes"],
            ["Thursday-Friday", "6:30 pm – 2:00 am", "every 15 minutes"],
            ["Saturday", "9:30 am – 2:00 am", "every 15 minutes"],
            ["Sunday", "9:30 am – 12:15 am", "every 15 minutes"],
          ]);
          break;
        case 123:
          setSelectedName('123 4th Street Circulator');
          setScheduleTimes([
            ["Monday-Friday", "7:00 am – 6:00 pm", "every 10 minutes"]
          ]);
          break;
        case 124:
          setSelectedName('124 St. Paul Campus Circulator');
          setScheduleTimes([
            ["Monday-Friday", "7:00 am – 6:00 pm", "every 20 minutes"]
          ]);
          break;
        case 120:
          setSelectedName('120 East Bank Circulator');
          setScheduleTimes([
            ["Monday-Friday", "7:00 am – 6:00 pm", "every 20 minutes"]
          ]);
          break;
      }
    }, [selectedSchedule]);

    return(<Schedule selectedName={selectedName} scheduleTimes={scheduleTimes} />)

  }

