export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);

  // Define options to format the date as "Month day, year"
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };

  // Format the date using en-US locale
  return date.toLocaleDateString("en-US", options);
}
