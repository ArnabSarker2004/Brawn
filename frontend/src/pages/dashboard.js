import React from 'react';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
const Dashboard = () => {
  const [date, setDate] = useState(null);
  return (
 
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      className="rounded-md border"
    />
  );
};

export default Dashboard;
