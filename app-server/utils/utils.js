const downloadLinks = [
  `https://raw.githubusercontent.com/ashutosh4336/csv-files/main/currency.csv`,
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/industry.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/color_srgb.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/day.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/month.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/time.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/timezone.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/weekday.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/year-future.csv',
  'https://raw.githubusercontent.com/ashutosh4336/csv-files/main/year-past.csv',
];
const pickRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export { downloadLinks, pickRandomNumber };
