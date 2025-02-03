const { test, describe, beforeEach, afterEach, beforeAll, afterAll, expect } = require('@playwright/test');
const { chromium } = require('playwright');

const host = 'http://localhost:3000'; // Application host (NOT service host - that can be anything)

let browser;
let context;
let page;

let user = {
    email : "",
    password : "123456",
    confirmPass : "123456",
};

let albumName = "";

describe("e2e tests", () => {
    beforeAll(async () => {
        browser = await chromium.launch();
    });

    afterAll(async () => {
        await browser.close();
    });

    beforeEach(async () => {
        context = await browser.newContext();
        page = await context.newPage();
    });

    afterEach(async () => {
        await page.close();
        await context.close();
    });

    
    describe("authentication", () => {
        test("register makes correct API call", async () => {
            await page.goto(host);
            await page.click('text=Register');

            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 1000);

            user.email = `abv_${random}@abv.bg`;

            await page.locator("#email").fill(user.email);
            await page.locator("#password").fill(user.password);
            await page.locator("#conf-pass").fill(user.confirmPass);
            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes('/users/register') && response.status() === 200),
                page.click('[type="submit"]')
            ]);
            
            await expect(response.ok()).toBeTruthy();
            let userData = await response.json();

            expect(userData.email).toBe(user.email);
            expect(userData.password).toEqual(user.password);
        });

        test("login makes correct API call", async () => {
            await page.goto(host);
            await page.click('text=Login');

            await page.waitForSelector('form');
            
            await page.locator("#email").fill(user.email);
            await page.locator("#password").fill(user.password);

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/users/login") && response.status() === 200),
                page.click('[type="submit"]')
            ]);
            
            expect(response.ok()).toBeTruthy();
            let userData = await response.json();

            expect(userData.email).toBe(user.email);
            expect(userData.password).toEqual(user.password);
        });

        test('logout makes correct API call', async () => {
            await page.goto(host);
            await page.click('text=Login');

            await page.waitForSelector('form');
            
            await page.locator("#email").fill(user.email);
            await page.locator("#password").fill(user.password);
            await page.click('[type="submit"]');

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/users/logout") && response.status() === 204),
                page.locator('nav >> text=Logout').click()
            ]);

            expect(response.ok).toBeTruthy();
            await page.waitForSelector('nav >> text=Login');

            expect(page.url()).toBe(host + "/");
        });
    })

    describe("navbar", () => {
        test('logged user should see correct navigation', async () => {
            await page.goto(host);

            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.locator("#email").fill(user.email);
            await page.locator("#password").fill(user.password);
            await page.click('[type="submit"]')

            await expect(page.locator('nav >> text=Home')).toBeVisible();
            await expect(page.locator('nav >> text=Catalog')).toBeVisible();
            await expect(page.locator('nav >> text=Search')).toBeVisible();
            await expect(page.locator('nav >> text=Create Album')).toBeVisible();
            await expect(page.locator('nav >> text=Logout')).toBeVisible();
            await expect(page.locator('nav >> text=Login')).toBeHidden();
            await expect(page.locator('nav >> text=Register')).toBeHidden();
        });

        test('guest user should see correct navigation', async () => {
            await page.goto(host);

            await expect(page.locator('nav >> text=Home')).toBeVisible();
            await expect(page.locator('nav >> text=Catalog')).toBeVisible();
            await expect(page.locator('nav >> text=Search')).toBeVisible();
            await expect(page.locator('nav >> text=Create Album')).toBeHidden();
            await expect(page.locator('nav >> text=Logout')).toBeHidden();
            await expect(page.locator('nav >> text=Login')).toBeVisible();
            await expect(page.locator('nav >> text=Register')).toBeVisible();
        });
    });

    describe("CRUD", () => {
        beforeEach(async () => {
            //login configuration for execution before each test
            await page.goto(host);

            await page.click('text=Login');
            await page.waitForSelector('form');
            await page.locator("#email").fill(user.email);
            await page.locator("#password").fill(user.password);
            await page.click('[type="submit"]')
        });

        test('create makes correct API call for logged in user', async () => {
            await page.click('text=Create Album');
            await page.waitForSelector('form');

            let random = Math.floor(Math.random() * 10000);
            albumName = `Random namer_${random}`; //creating a unique name is important for the next test. It makes searching easy and ensures we have the right album for edit testing

            await page.fill('[name="name"]', albumName);
            await page.fill('[name="imgUrl"]', "/images/pinkFloyd.jpg");
            await page.fill('[name="price"]', "15");
            await page.fill('[name="releaseDate"]', "29 June 2024");
            await page.fill('[name="artist"]', "Unknown");
            await page.fill('[name="genre"]', "Random genre");
            await page.fill('[name="description"]', "Random description");

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/data/albums") && response.status() === 200),
                page.click('[type="submit"]')
            ]);

            await expect(response.ok()).toBeTruthy();
            let albumData = await response.json();
            
            expect(albumData.name).toEqual(albumName);
            expect(albumData.imgUrl).toEqual('/images/pinkFloyd.jpg');
            expect(albumData.price).toEqual('15');
            expect(albumData.releaseDate).toEqual('29 June 2024');
            expect(albumData.artist).toEqual('Unknown');
            expect(albumData.genre).toEqual('Random genre');
            expect(albumData.description).toEqual('Random description');
        });

        test('edit makes correct API call', async () => {
            await page.click('text=Search'); //click on navbar search button

            await page.fill('#search-input', albumName); //use the saved album name for search
            await page.click('.button-list'); //click on search button to the input field

            await page.locator(`text=Details`).first().click();
            await page.click('text=Edit');

            await page.waitForSelector('form');

            albumName = albumName + "_edited"; //changing album name, so we save the changes in the variable. This is necessary because we search for the album by name. Therefore, if the name changes, we will search for the new name in the next test for deletion.
            await page.locator('[name="name"]').fill(albumName);

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/data/albums") && response.status() === 200),
                page.click('[type="submit"]')
            ]);

            expect(response.ok).toBeTruthy();
            let albumData = await response.json()
            
            expect(albumData.name).toEqual(albumName + "_edited");
            expect(albumData.imgUrl).toEqual('/images/pinkFloyd.jpg');
            expect(albumData.price).toEqual('15');
            expect(albumData.releaseDate).toEqual('29 June 2024');
            expect(albumData.artist).toEqual('Unknown');
            expect(albumData.genre).toEqual('Random genre');
            expect(albumData.description).toEqual('Random description');
        });

        test('delete makes correct API call for owner', async () => {
            await page.click('text=Search'); //click on navbar search button

            await page.fill('#search-input', albumName); //search by album name
            await page.click('.button-list'); //click on search button to the input field

            await page.locator(`text=Details`).first().click(); 

            let [response] = await Promise.all([
                page.waitForResponse(response => response.url().includes("/data/albums") && response.status() === 200),
                page.click('text=Delete')
            ]);

            expect(response.ok()).toBeTruthy();
        });
    })
})