import Web3 from 'web3';
import configuration from '../build/contracts/Medicines.json';
import 'bootstrap/dist/css/bootstrap.css';
import ticketImage from './images/medicine.png';

const createElementFromString = (string) => {
  const el = document.createElement('div');
  el.innerHTML = string;
  return el.firstChild;
};

const CONTRACT_ADDRESS = configuration.networks['5777'].address;
const CONTRACT_ABI = configuration.abi;

let web3;
let account;
let contract;

const accountEl = document.getElementById('account');
const ticketsEl = document.getElementById('tickets');
const TOTAL_TICKETS = 10;
const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

const buyTicket = async (ticket) => {
  // Ensure ticket.price is a BigInt before sending transaction
  const priceInWei = BigInt(ticket.price); 
  await contract.methods
    .buyTicket(ticket.id)
    .send({ from: account, value: priceInWei });
};

const refreshTickets = async () => {
  ticketsEl.innerHTML = '';
  for (let i = 0; i < TOTAL_TICKETS; i++) {
    const ticket = await contract.methods.medicines(i).call();
    ticket.id = i;
    if (ticket.owner === EMPTY_ADDRESS) {
      const ticketPriceInEth = Number(ticket.price) / 1e18; // Convert BigInt to Number for display
      const ticketEl = createElementFromString(
        `<div class="ticket card" style="width: 18rem;">
          <img src="${ticketImage}" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">Medicine</h5>
            <p class="card-text">${ticketPriceInEth} Eth</p>
            <button class="btn btn-primary">Buy Medicine</button>
          </div>
        </div>`
      );
      ticketEl.onclick = buyTicket.bind(null, ticket);
      ticketsEl.appendChild(ticketEl);
    }
  }
};

const initializeWeb3 = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      account = accounts[0];
      accountEl.innerText = account;

      contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

      await refreshTickets();
    } catch (error) {
      console.error("User denied account access or other issue:", error);
    }
  } else {
    console.error("Ethereum provider not found. Install MetaMask.");
  }
};

initializeWeb3();
