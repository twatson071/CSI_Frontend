const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/data/dummyDeviceData.ts', 'utf8');

// Find the dummyDevices array
const devicesStart = content.indexOf('export const dummyDevices: Device[] = [');
const devicesEnd = content.lastIndexOf('];');
const beforeDevices = content.substring(0, devicesStart);
const afterDevices = content.substring(devicesEnd + 2);

// Parse and fix each device
const deviceLines = content.substring(devicesStart, devicesEnd + 2);

// Regular expression to match device objects
const deviceRegex = /\{[^{}]*(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}[^{}]*)*\}/g;
const matches = deviceLines.match(deviceRegex);

let fixedDevices = 'export const dummyDevices: Device[] = [';

if (matches) {
  matches.forEach((deviceStr, index) => {
    // Extract base properties
    const id = deviceStr.match(/id:\s*(\d+)/)?.[1];
    const name = deviceStr.match(/name:\s*'([^']+)'/)?.[1];
    const type = deviceStr.match(/type:\s*'([^']+)'/)?.[1];
    const status = deviceStr.match(/status:\s*'([^']+)'/)?.[1];
    const siteId = deviceStr.match(/siteId:\s*(\d+)/)?.[1];
    const ipAddress = deviceStr.match(/ipAddress:\s*'([^']+)'/)?.[1];
    
    // Extract everything else as data
    let dataContent = deviceStr
      .replace(/id:\s*\d+,?\s*/g, '')
      .replace(/name:\s*'[^']+',?\s*/g, '')
      .replace(/type:\s*'[^']+',?\s*/g, '')
      .replace(/status:\s*'[^']+',?\s*/g, '')
      .replace(/siteId:\s*\d+,?\s*/g, '')
      .replace(/ipAddress:\s*'[^']+',?\s*/g, '')
      .replace(/^\s*\{/, '')
      .replace(/\}\s*$/, '')
      .trim();
    
    // Build the fixed device object
    let fixedDevice = `
  {
    id: ${id},
    name: '${name}',
    type: '${type}',
    status: '${status}',
    siteId: ${siteId},
    ipAddress: '${ipAddress}'`;
    
    if (dataContent) {
      // Remove trailing comma if present
      dataContent = dataContent.replace(/,\s*$/, '');
      fixedDevice += `,
    data: {
      ${dataContent}
    }`;
    }
    
    fixedDevice += '\n  }';
    
    if (index < matches.length - 1) {
      fixedDevice += ',';
    }
    
    fixedDevices += fixedDevice;
  });
}

fixedDevices += '\n];';

// Write the fixed content
const newContent = beforeDevices + fixedDevices + afterDevices;
fs.writeFileSync('src/data/dummyDeviceData.ts', newContent);

console.log('Fixed dummy data');
