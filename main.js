import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export class DataService {
  constructor(csvParts) {
    this.csvPaths = csvParts;
    this.data = [];
  }

  async load() {
    const loaded = await Promise.all(
      this.csvPaths.map(p => d3.csv(p))
    );

    this.data = loaded.flat().map(d => ({
      ...d,
      YearStart: +d.YearStart,
      Data_Value: +d.Data_Value
    }));
  }

  getFiltered(question) {
    return this.data.filter(d =>
      d.Question === question &&
      d.Data_Value_Type === "Percentage" &&
      (d.Stratification1 === "Overall" || !d.Stratification1)
    );
  }

  getYearlyAverages(question) {
    return d3.groups(this.getFiltered(question), d => d.YearStart)
      .map(([year, arr]) => ({
        YearStart: year,
        Data_Value: d3.mean(arr, v => v.Data_Value)
      }))
      .sort((a, b) => a.YearStart - b.YearStart);
  }
}

const csvParts = Array.from(
  { length: 15 },
  (_, i) => `data/health_part${i + 1}.csv`
);

const dataService = new DataService(csvParts);

document.addEventListener("DOMContentLoaded", async () => {
  await dataService.load();

  updateTotalSurvey();
});

function updateTotalSurvey() {
  d3.select("#totalCount")
    .text(dataService.data.length);
}

