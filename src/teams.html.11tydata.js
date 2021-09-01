module.exports = {
  eleventyComputed: {
    games: data => {
      const {abbreviation, sport } = data.team;
      return data[sport].teamSchedules.get(abbreviation.toLowerCase());
    }
  }
}
