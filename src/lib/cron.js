import cron from 'cron';
import https from 'https';
import "dotenv/config";

const job = new cron.CronJob("*/11 * * * *", () => {
  const url = process.env.API_URL;

  if (!url) {
    console.error('API_URL is not defined in environment variables.');
    return;
  }

  https.get(url, (res) => {
    const { statusCode } = res;

    if (statusCode === 200) {
      console.log(`[${new Date().toISOString()}] GET request sent successfully.`);
    } else {
      console.error(`[${new Date().toISOString()}] GET request failed with status code: ${statusCode}`);
    }

    // Optional: consume response data to free up memory
    res.resume();

  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error executing cron job:`, err.message);
  });
});

// Optional: Start the job if you don't start it elsewhere
// job.start();

export default job;


