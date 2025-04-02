const config = {
    ftcApi: {
        username: process.env.REACT_APP_FTC_API_USERNAME,
        key: process.env.REACT_APP_FTC_API_KEY,
        baseUrl: 'https://ftc-api.firstinspires.org/v2.0'
    }
};

if (!config.ftcApi.username || !config.ftcApi.key) {
    console.error('FTC API credentials are missing in environment variables');
}

export default config;