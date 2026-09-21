import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    duration: '10s',

    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<2000'],
    },
};

export default function () {

    const url =
        'https://opensource-demo.orangehrmlive.com/web/index.php/auth/validate';

    const payload =
        '_token=7bd47f8a86d8f206f2ed5fd9d6c559f.nmIdslRcwOV73cg55HcEchWpqsL1SbubZkhP2XQzE58.yltawBkpqLIPlP5TvABoMUac2PXFEeP6Un976hNqRc3OLFSGITWPkTy4kQ' +
        '&username=Admin' +
        '&password=admin123';

    const params = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    };

    const response = http.post(url, payload, params);

    console.log('Status:', response.status);
    console.log('Response:', response.body);

    check(response, {
        'Login request completed': (r) =>
            r.status === 200 || r.status === 302,
    });
}