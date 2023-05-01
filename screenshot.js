const puppeteer = require('puppeteer');
const handler = require('serve-handler');
const http = require('http');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const history = [
  'bb7b20687bdcc0bda2d3be4f11fdfc25dd0af085',
  'c77161362e93cca96360ed31a712946405e143e5',
  '5e54ba2fd7053b4868b8921156eb77e6abee954c',
  '3c9d6480b26cfda64634e1f1e43b77157b8331e9',
  '7d2a3688f76516037197911f951b2cef58b49829',
  'a4574561543ac5ec6e9fea26e42d65bcd3568546',
  '32510b8a5cd4388e76182ca720bda43addc73201',
  'cdd427d0ebd54cec449444499ba0542eceeb8890',
  'e59286a96b18fdeea08176db6ffcb45c6b687dca',
  '53a9dcf08d4c71c13c0351ba769e1e3a4bc3e542',
  '4cadc177a83716daaa7181a492cffaf9149d3ce8',
  '133f46e5a1019f5dd5a35ea04720081dbc6603b6',
  '4dd0ff2ea8ada6d98aafb0edcbbf2c6b87eafddc',
  '4590e66cc9be1cc869290db462404e43845cc4aa',
  '895348c76276c734de82f7d048f915ce95abba85',
  '11c84abdf1e2b312fc9f0dd37a854f7e877d59f0',
  '4bdd422f6e6c6b747719286482568bde30b878d5',
  '9e460aa75cf6e6e3266dbec1cba3d2891a3408ba',
  'a517e5fedfc7c9ddac01d3cf2dad43fad577f674',
  'd277d5d1b62c2e9dc0a05c5c6ee1e3c22e703249',
  '14ef101fe4b047c1f23134f2a5dcd6035dd4ea4a',
  '5b569fee9b8044d673963aaa472b1879405118e1',
  '8978474756bb9957d8f5caf86f384bd9e5076597',
  '7bf921b48bd151bfaead7c30181c10a6ea6bb84f',
  '711e96aac2a9158c56db4ccad5582d9c927cae0e',
  '4e26885d1d51b00748390e27fdec393921b1aa63',
  '633cafe39b5a1c7deca599d5e25ee9e83cb607af',
  '4b9e9a24242412195010f44ac55a0d4627a4cd21',
  'ed3bdb7292d34607b9b353276c41d4210ec4e6ed',
  '72e656e7116dca10f1160bc6e7cd2531ae14e205',
  '9812eb61035d1198ec90a9f1e9c32e2cadc38e80',
  '405df232b4bf0cffbfff09975729b825b339bfbe',
  '2c85968c8415f1648c9957a63158859f3765359e',
  'd1b21fa4be67f084cd5c3acf31cb71f7e4ba4a61',
  '48dfd6c2656550d7649112aac2e68c5f6d4a1d8d',
  '65d72e667b65972523c2af0f529e8a95fc76c1c1',
  'e8b2cc352559b3a12a8a0df8228eb794d2a7f512',
  '3bea2f62e014e5ca8b65cff7e81676fb4365e57f',
  '9d34848cd1f130f75d6f8579aba84df7595065d2',
  '29fd7fa3f977a902f28cd2457c600e14355f2b33',
  '96171e128ab05ff7e0860b6fee2e5310f89bf7cc',
  '0b4753ffb6829f91c4847d88add763445df3e1f1',
  'b8ed0b9a66221e6d272608bcc385c22528cd39ce',
  '0658d1486a0c45a14e6e8e4a2d42a5eb17763c64',
  '93e36296057929077e1b516a455f82616d5e61fd',
  '0bf4e5c73614e965e80b325ec639b929156168c3',
  '7d56a6fa3919bffcb75b519c1935782ff3a68dd9',
  'a646c41b631e322ed060c062829120ba28142902',
  '1ee86b242be3787b0e9bfd891682062ca5c0c063',
  'fcccd60c999da03933d51c131417c0159c587a0d',
  '7fd7f4235c29756092cb54be607ed99cb3d9417b',
  'a0498ececc095a74c1ff35f6938cc19bd47b5d13',
  'c27c521842acd2c48269d2364e10eada367c72a6',
  '628e833450aeeef88708a5f0bccd3becc3803495',
  '2f259ba72cd524ffa72d39510cb045b002712cb4',
  '8c9ddf004a958f5269d013eafce6e59660bea96b',
  '603cb6b2e9b1ba63e00851e818f8a36be77c77b6',
  'a88b0d68228f8e3bdf730594a9449df4343a9015',
  '00e3b6fb45e40da0e76b98277013080b2aaa6948',
  '261aa61b3f6a98887c8193b1087a86c052226f7c',
  '111b9b3e5d3de1abc0d72e14c2a38748f9460367',
  '4a853833b171dfa674a92358fe54133038d927ca',
  '699bfdaf8a6d337f9f6632164efbd0dbff7ac863',
  'efd1ded97695829ff0304f53554e875d14eb3537',
].reverse();

const server = http.createServer((request, response) => {
  return handler(request, response, {
    directoryListing: true,
    public: 'build'
  });
});

server.listen(3001, () => {
  console.log('Running at http://localhost:3001');
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 2000, height: 1400 });


  let i = 0;
  for (const commitHash of history) {
    i += 1;
    await page.goto('http://localhost:3001');
    await exec(`git checkout ${commitHash}`);
    await exec('./build.sh');
    await page.reload();
    await page.evaluate(_ => {
      window.scrollTo(0, 0);
    });

    const firstLink = await page.$('a')
    firstLink.click();

    await wait(1000);
    await page.screenshot({
      path: `screenshots/photo/${String(i).padStart(3, '0')}.png`
    });
  }

  server.close(console.log);
}

run();
