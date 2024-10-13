import https from 'https'

export async function fetchOTP(hostname, path, data) {
    return new Promise(async (resolve, reject) => {

        const options = {
            hostname: hostname,
            path: path,
            port: 443,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const body = [];

        const req = https.request(options, res => {
            // console.log('httpsPost statusCode:', res.statusCode);
            // console.log('httpsPost headers:', res.headers);

            res.on('data', d => {
                body.push(d);
            });
            res.on('end', () => {
                // console.log(`httpsPost data: ${body}`);
                resolve(JSON.parse(Buffer.concat(body).toString()));
            });
        });
        req.on('error', e => {
            // console.log(`ERROR httpsPost: ${e}`);
            reject(e);
        });
        req.write(data);
        req.end();

    });

}