import React from 'react';
import Schedule121 from './Schedule121.tsx';
import Schedule122 from './Schedule122.tsx';
import Schedule123 from './Schedule123.tsx';
import Schedule124 from './Schedule124.tsx';
import Schedule120 from './Schedule120.tsx';

  export default function ScheduleTable({selectedSchedule}){

    switch(selectedSchedule){
      case 121:
        return(<Schedule121 />)
      case 122:
        return(<Schedule122 />)
      case 123:
        return(<Schedule123 />)
      case 124:
        return(<Schedule124 />)
      case 120:
        return(<Schedule120 />)

      
    }

  }

