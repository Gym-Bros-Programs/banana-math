import type { GetServerSideProps } from 'next';

import clientPromise from '../utils/MongoDB';

interface ConnectionStatus {
  isConnected: boolean;
}

export const getServerSideProps: GetServerSideProps<
  ConnectionStatus
> = async () => {
  try {
    await clientPromise;
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However, you can use another database (e.g., myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // const client = await clientPromise
    // const db = client.db("myDatabase")
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
};

const StatusPage = ({ isConnected }: ConnectionStatus) => {
  return (
    <div
      className={`p-4 text-center font-bold text-white ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
    >
      Database Connection Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};

export default StatusPage;
