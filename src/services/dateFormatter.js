function dateFormatter(postDate) {
  const date = new Date(postDate);
  const month = date.getMonth();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];
  const day = date.getDay();
  const utcDate = date.getUTCDate();
  const year = date.getFullYear();
  const hour = date.getHours();
  const minute = date.getMinutes();

  if (hour >= 12) {
    const timeFormat = "PM";
    if (hour > 12) {
      const formattedHour = hour - 12;
      if (minute < 10) {
        const formattedMinute = `0${minute}`;
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${formattedHour}:${formattedMinute} ${timeFormat}`;
      } else {
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${formattedHour}:${minute} ${timeFormat}`;
      }
    } else if (hour === 12) {
      if (minute < 10) {
        const formattedMinute = `0${minute}`;
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${hour}:${formattedMinute} ${timeFormat}`;
      } else {
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${hour}:${minute} ${timeFormat}`;
      }
    }
  } else {
    const timeFormat = "AM";
    if (hour === 0) {
      const formattedHour = hour + 12;
      if (minute < 10) {
        const formattedMinute = `0${minute}`;
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${formattedHour}:${formattedMinute} ${timeFormat}`;
      } else {
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${formattedHour}:${minute} ${timeFormat}`;
      }
    }
    if (hour > 0) {
      if (minute < 10) {
        const formattedMinute = `0${minute}`;
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${hour}:${formattedMinute} ${timeFormat}`;
      } else {
        return `${days[day]}, ${months[month]} ${utcDate}, ${year}, ${hour}:${minute} ${timeFormat}`;
      }
    }
  }
}

export default dateFormatter;
