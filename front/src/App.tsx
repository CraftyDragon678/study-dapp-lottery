import './App.css';

import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { useCallback, useEffect, useRef, useState } from 'react';

const lotteryAddress = '0x35C2910597522D2165F6BAf3739Cd0D7fE550c32';
const lotteryABI = [
    {
      "inputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "BET",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "answer",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "DRAW",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "answer",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "FAIL",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "REFUND",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "bytes1",
          "name": "answer",
          "type": "bytes1"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        }
      ],
      "name": "WIN",
      "type": "event"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "answerForTest",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address payable",
          "name": "",
          "type": "address"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "getPot",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        }
      ],
      "name": "bet",
      "outputs": [
        {
          "internalType": "bool",
          "name": "result",
          "type": "bool"
        }
      ],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        }
      ],
      "name": "betAndDistribute",
      "outputs": [
        {
          "internalType": "bool",
          "name": "result",
          "type": "bool"
        }
      ],
      "payable": true,
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [],
      "name": "distribute",
      "outputs": [],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "answer",
          "type": "bytes32"
        }
      ],
      "name": "setAnswerForTest",
      "outputs": [
        {
          "internalType": "bool",
          "name": "result",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        },
        {
          "internalType": "bytes32",
          "name": "answer",
          "type": "bytes32"
        }
      ],
      "name": "isMatch",
      "outputs": [
        {
          "internalType": "enum Lottery.BettingResult",
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "pure",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "getBetInfo",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "answerBlockNumber",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "bettor",
          "type": "address"
        },
        {
          "internalType": "bytes1",
          "name": "challenges",
          "type": "bytes1"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }
  ] as AbiItem[];

function App() {
  const web3 = useRef<Web3>();
  const account = useRef<string>();
  const lotteryContract = useRef<Contract>();

  const [betRecords, setBetRecords] = useState<typeof finalRecords>([]);
  const [winRecords, setWinRecords] = useState<{index: string, amount: string}[]>([]);
  const [failRecords, setFailRecords] = useState<{index: string, answer: string}[]>([]);
  const [pot, setPot] = useState('0');
  const [challenges, setChallenges] = useState(['A', 'B']);
  const [finalRecords, setFinalRecords] = useState([{
    bettor: '0xabcd...',
    index: '0',
    challenges: 'ab',
    answer: 'ab',
    betBlockNumber: '10',
    targetBlockNumber: '10',
    pot: '0',
    win: '?',
  }]);

  const initWeb3 = async () => {
    if (window.ethereum) {
      console.log('recent mode');
      web3.current = new Web3(window.ethereum);
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error(`User denied account access error: ${error}`);
      }
    } else if (window.web3) {
      console.log('legacy mode');
      new Web3(window.web3.currentProvider);
    } else {
      console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }

    if (!web3.current) return;
    const accounts = await web3.current.eth.getAccounts();
    account.current = accounts[0];

    lotteryContract.current = new web3.current.eth.Contract(lotteryABI, lotteryAddress);
    // 값만 읽어오면 call
    // const owner = await lotteryContract.current.methods.owner().call();
    // console.log(owner);
  };

  const getPot = async () => {
    if (!web3.current || !lotteryContract.current) return '';
    const pot = await lotteryContract.current.methods.getPot().call();
    return web3.current.utils.fromWei(pot, 'ether');
  };

  const getBetEvents = async () => {
    if (!web3.current || !account.current || !lotteryContract.current) return [];
    const events = await lotteryContract.current.getPastEvents('BET', { fromBlock: 0, toBlock: 'latest' });

    return (
      events.map((event) => (
        {
          index: event.returnValues.index,
          bettor: event.returnValues.bettor,
          betBlockNumber: event.blockNumber.toString(),
          targetBlockNumber: event.returnValues.answerBlockNumber,
          challenges: event.returnValues.challenges,
          win: 'Not Revealed',
          answer: '0x00',
          pot: '0',
        }
      )).reverse()
    );
  }

  const getWinEvents = async () => {
    if (!web3.current || !account.current || !lotteryContract.current) return [];
    const events = await lotteryContract.current.getPastEvents('WIN', { fromBlock: 0, toBlock: 'latest' });

    return (
      events.map((event) => (
        {
          index: event.returnValues.index,
          amount: event.returnValues.amount,
        }
      )).reverse()
    );
  }

  const getFailEvents = async () => {
    if (!web3.current || !account.current || !lotteryContract.current) return [];
    const events = await lotteryContract.current.getPastEvents('FAIL', { fromBlock: 0, toBlock: 'latest' });

    return (
      events.map((event) => (
        {
          index: event.returnValues.index,
          answer: event.returnValues.answer,
        }
      )).reverse()
    );
  }

  const bet = async () => {
    if (!web3.current || !account.current || !lotteryContract.current) return;
    const nonce = await web3.current.eth.getTransactionCount(account.current);
    await lotteryContract.current.methods.betAndDistribute(
      `0x${challenges[0].toLowerCase()}${challenges[1].toLowerCase()}`,
    ).send({ from: account.current, value: 5 * 10 ** 15, gas: 300000, nonce })
      .on('transactionHash', console.log);
  };

  useEffect(() => {
    let fail = 0;
    let win = 0;

    setFinalRecords(
      betRecords
        .slice()
        .map((betRecord, index, records) => {
          if (winRecords.length > 0 && betRecord.index === winRecords[win].index) {
            const result = {
              ...betRecord,
              win: 'WIN',
              answer: betRecord.challenges,
              pot: web3.current!.utils.fromWei(winRecords[win].amount, 'ether'),
            };
            if (winRecords.length - 1 > win) win += 1;
            return result;
          }
          if (failRecords.length > 0 && betRecord.index === failRecords[fail].index) {
            const result = {
              ...betRecord,
              win: 'FAIL',
              answer: failRecords[fail].answer,
              pot: '0',
            };
            if (failRecords.length - 1 > fail) fail += 1;
            return result;
          }
          return {
            ...betRecord,
            answer: 'Not Revealed',
          };
        })
    );
  }, [betRecords, failRecords, winRecords]);

  const pollData = useCallback(async () => {
    setPot(await getPot());
    setBetRecords(await getBetEvents());
    setWinRecords(await getWinEvents());
    setFailRecords(await getFailEvents());
  }, []);

  useEffect(() => {
    initWeb3().then(async () => {
      if (!web3.current) return;
      setInterval(pollData, 1000);
    });
  }, [pollData]);

  const onClickCard = (character: string) => {
    setChallenges([challenges[1], character]);
  };

  const Card = ({ character, cardstyle }: { character: string, cardstyle: string }) => (
    <button className={cardstyle} onClick={() => onClickCard(character)}>
      <div className="card-body text-center">
        <p className="card-text"></p>
        <p className="card-text text-center">{character}</p>
        <p className="card-text"></p>
      </div>
    </button>
  )

  return (
    <div className="App">
      
      <div className="container">
        <div className="jumbotron">
          <h1>{`Current Pot: ${pot}`}</h1>
          <p>Lottery</p>
          <p>Lottery tutorial</p>
          <p>Your Bet</p>
          <p>{`${challenges[0]} ${challenges[1]}`}</p>
        </div>
      </div>

      <div className="container">
        <div className="card-group">
          <Card character="A" cardstyle="card bg-primary" />
          <Card character="B" cardstyle="card bg-warning" />
          <Card character="C" cardstyle="card bg-danger" />
          <Card character="D" cardstyle="card bg-success" />
        </div>
      </div>

      <br />

      <div className="container">
        <button className="btn btn-danger btn-lg" onClick={bet}>BET!</button>
      </div>

      <br />

      <div className="container">
        <table className="table table-dark table-striped">
          <thead>
            <tr>
              <th>Index</th>
              <th>Address</th>
              <th>Challenge</th>
              <th>Answer</th>
              <th>Pot</th>
              <th>Status</th>
              <th>AnswerBlockNumber</th>
            </tr>
          </thead>
          <tbody>
            {finalRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.betBlockNumber}</td>
                <td>{record.bettor}</td>
                <td>{record.challenges}</td>
                <td>{record.answer}</td>
                <td>{record.pot}</td>
                <td>{record.win}</td>
                <td>{record.targetBlockNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
