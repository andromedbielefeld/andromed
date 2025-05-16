// Update the handleSlotToggle function in DevicesManager.tsx
const handleSlotToggle = async (date: string, index: number) => {
  if (!selectedDevice) return;

  // Get current slots for the date or initialize new array
  const currentSlots = selectedDevice.availableSlots[date] || Array(24).fill(false);
  
  // Create new array with toggled slot
  const newSlots = [...currentSlots];
  newSlots[index] = !newSlots[index];

  // Update slots state
  setSlots(newSlots);

  // Update device slots in database
  await updateAvailableSlots(selectedDevice.id, date, newSlots);
};

// Update the handleDateChange function
const handleDateChange = (date: Date) => {
  setSelectedDate(date);
  if (selectedDevice) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const deviceSlots = selectedDevice.availableSlots[dateStr] || Array(24).fill(false);
    setSlots(deviceSlots);
  }
};

export default handleDateChange