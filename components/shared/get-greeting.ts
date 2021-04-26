export const getGreeting = () => {
  const hours = new Date().getHours();
  return hours < 12 ? 'Morning' : hours <= 18 && hours >= 12 ? 'Afternoon' : 'Night';
};
