const http = require("http");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { assert } = require("console");

let server;
let browser;
let page;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    fs.readFile(__dirname + "/.." + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(JSON.stringify(err));
        return;
      }
      res.writeHead(200);
      res.end(data);
    });
  });

  server.listen(process.env.PORT || 3000);
});

afterAll(() => {
  server.close();
});

beforeEach(async () => {
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    page = await browser.newPage();
    await page.goto("http://localhost:3000/index.html");
  } catch (error) {
    console.error("Failed to launch Puppeteer browser:", error);
    throw error;
  }
});

afterEach(async () => {
  try {
    await browser.close();
  } catch (error) {
    console.error("Failed to close Puppeteer browser:", error);
  }
});

describe("the drop-down-content", () => {
  it("should not be initially visible", async () => {
    const value = await page.$eval('div[class="drop-down-content"]', (div) => {
      let listStyle = window.getComputedStyle(div);
      return listStyle.getPropertyValue("display");
    });

    expect(value).toBe("none");
  });
});

describe("the drop-down-content", () => {
  it("should be displayed when hovering over the drop-down", async () => {
    const matches = await page.$eval('style', (style) => {
      return style.innerHTML.match(
        /\.drop-down:.*hover.*\.drop-down-content.*{[\s\S][^}]*display.*:.*block.*;/g
      ).length;
    });

    expect(matches).toEqual(1);
  });
});
