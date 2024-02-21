import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { GetLastBlock } from "./src/client";

const start = async () => {
    const collectorOptions = {
        url: 'http://localhost:4318/v1/metrics',
        concurrencyLimit: 1, // an optional limit on pending requests
      };
      const metricExporter = new OTLPMetricExporter(collectorOptions);
      const meterProvider = new MeterProvider({});
      
      meterProvider.addMetricReader(new PeriodicExportingMetricReader({
        exporter: metricExporter,
      }));
      
    // Now, start recording data
    const meter = meterProvider.getMeter('ethereum-node-metrics');
    const transactionCounter = meter.createCounter('ethereum_transactions');
    const gasUsedHistogram = meter.createHistogram('ethereum_gas_used');
     
    async function myFunction() {
        console.log('Interval executed!'); // Print a message at each interval
        const lastBlock = await GetLastBlock()
    const blockNumber = parseInt(lastBlock.number, 16)
    const gasLimit = parseInt(lastBlock.gasLimit, 16)
    const gasUsed = parseInt(lastBlock.gasUsed, 16)
    const blockAttributes = { blockNumber, blockHash: lastBlock.hash }

    transactionCounter.add(lastBlock.transactions.length,blockAttributes); // Counting the number of transactions

    // const gasLimitGauge = meter.createObservableGauge('ethereum_gas_limit');
    // gasLimitGauge.addCallback

    gasUsedHistogram.record(gasUsed,blockAttributes)
    console.log({blockNumber,gasLimit,gasUsed,blockAttributes})
    }
    
    // Set an interval to call myFunction every 2000 milliseconds (2 seconds)
    const interval = 5000; // Interval in milliseconds
    setInterval(myFunction, interval);
    
};

start();

