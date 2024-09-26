<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import * as gameLogic from '$lib/gameLogic';

  let playerName = '';
  let money = 10000;
  let reputation = 50;
  let influence = 0;
  let day = 1;
  let businesses: gameLogic.Business[] = [
    { id: 1, name: "Lucky's Casino", type: 'casino', level: 1, legalIncome: 1000, illegalIncome: 2000, risk: 20, staff: 5, security: 1 },
    { id: 2, name: 'Clean Cut Laundromat', type: 'laundromat', level: 1, legalIncome: 500, illegalIncome: 1000, risk: 10, staff: 3, security: 1 },
    { id: 3, name: "Mama's Restaurant", type: 'restaurant', level: 1, legalIncome: 800, illegalIncome: 1500, risk: 15, staff: 4, security: 1 },
    { id: 4, name: "Neon Dreams Nightclub", type: 'nightclub', level: 1, legalIncome: 1200, illegalIncome: 2500, risk: 25, staff: 6, security: 2 },
  ];

  let selectedBusiness: gameLogic.Business | null = null;
  let gameStarted = false;
  let gameOver = false;
  let eventLog: string[] = [];
  let policeAttention = 0;
  let rivalFamilies: gameLogic.RivalFamily[] = [
    { name: 'Corleone Family', power: 100, relationship: 0 },
    { name: 'Tattaglia Family', power: 80, relationship: 0 },
    { name: 'Barzini Family', power: 90, relationship: 0 },
  ];

  let mounted = false;

  onMount(() => {
    mounted = true;
    const gameLoop = setInterval(() => {
      if (gameStarted && !gameOver) {
        day += 1;
        businesses.forEach(business => {
          money += Math.floor(business.legalIncome / 30);
        });
        if (Math.random() < 0.1) {
          const randomEvent = Math.random();
          if (randomEvent < 0.3) {
            const amount = Math.floor(money * 0.1);
            money -= amount;
            logEvent(`Unexpected expenses: Lost $${amount}`);
          } else if (randomEvent < 0.6) {
            reputation += 5;
            logEvent('Positive press coverage: Reputation increased');
          } else {
            influence += 3;
            logEvent('Your influence in the city has grown');
          }
        }
        simulateRivalActions();
        checkGameOver();
      }
    }, 5000); // Run every 5 seconds

    return () => clearInterval(gameLoop);
  });

  function startGame(): void {
    gameLogic.startGame(playerName);
    gameStarted = true;
  }

  function selectBusiness(business: gameLogic.Business): void {
    selectedBusiness = business;
  }

  function upgradeBusiness(): void {
    if (selectedBusiness && money >= 5000) {
      money -= 5000;
      selectedBusiness.level += 1;
      selectedBusiness.legalIncome = Math.floor(selectedBusiness.legalIncome * 1.5);
      selectedBusiness.illegalIncome = Math.floor(selectedBusiness.illegalIncome * 1.8);
      selectedBusiness.risk = Math.max(selectedBusiness.risk - 2, 5);
      logEvent(`Upgraded ${selectedBusiness.name} to level ${selectedBusiness.level}`);
    }
  }

  function hireStaff(): void {
    if (selectedBusiness && money >= 1000) {
      money -= 1000;
      selectedBusiness.staff += 1;
      selectedBusiness.legalIncome = Math.floor(selectedBusiness.legalIncome * 1.1);
      selectedBusiness.illegalIncome = Math.floor(selectedBusiness.illegalIncome * 1.15);
      logEvent(`Hired new staff for ${selectedBusiness.name}`);
    }
  }

  function improveSecurity(): void {
    if (selectedBusiness && money >= 2000) {
      money -= 2000;
      selectedBusiness.security += 1;
      selectedBusiness.risk = Math.max(selectedBusiness.risk - 5, 1);
      logEvent(`Improved security for ${selectedBusiness.name}`);
    }
  }

  function collectIncome(type: 'legal' | 'illegal'): void {
    if (selectedBusiness) {
      if (type === 'legal') {
        money += selectedBusiness.legalIncome;
        reputation += 1;
        logEvent(`Collected $${selectedBusiness.legalIncome} legal income from ${selectedBusiness.name}`);
      } else {
        money += selectedBusiness.illegalIncome;
        reputation -= 2;
        influence += 1;
        policeAttention += 2;
        if (Math.random() * 100 < selectedBusiness.risk) {
          triggerPoliceRaid();
        }
        logEvent(`Collected $${selectedBusiness.illegalIncome} illegal income from ${selectedBusiness.name}`);
      }
    }
  }

  function triggerPoliceRaid(): void {
    if (selectedBusiness) {
      const lossPercentage = Math.max(20 - selectedBusiness.security * 2, 5);
      const moneyLost = Math.floor(money * (lossPercentage / 100));
      money -= moneyLost;
      reputation -= 10;
      policeAttention += 10;
      logEvent(`Police raid at ${selectedBusiness.name}! Lost $${moneyLost} and reputation decreased.`);
    }
  }

  function bribePolice(): void {
    if (money >= 5000) {
      money -= 5000;
      policeAttention = Math.max(policeAttention - 20, 0);
      reputation -= 5;
      logEvent('Bribed the police to reduce attention');
    }
  }

  function negotiateWithRivals(): void {
    if (influence >= 10) {
      influence -= 10;
      rivalFamilies.forEach(family => {
        family.relationship += 5;
      });
      logEvent('Negotiated with rival families to improve relationships');
    }
  }

  function expandTerritory(): void {
    if (money >= 10000 && influence >= 20) {
      money -= 10000;
      influence -= 20;
      reputation += 10;
      const newBusiness = gameLogic.generateNewBusiness(playerName, businesses);
      businesses = [...businesses, newBusiness];
      logEvent(`Expanded territory and acquired ${newBusiness.name}`);
    }
  }

  function logEvent(event: string): void {
    eventLog = [event, ...eventLog.slice(0, 9)];
  }

  function checkGameOver(): void {
    if (money <= 0 || reputation <= 0) {
      gameOver = true;
      logEvent('Game Over! Your empire has fallen.');
    }
  }

  function simulateRivalActions(): void {
    rivalFamilies.forEach(family => {
      if (Math.random() < 0.1) {
        const action = Math.random();
        if (action < 0.4 && family.relationship < 0) {
          // Attack player
          const damage = Math.floor(family.power / 10);
          money = Math.max(money - damage, 0);
          reputation -= 5;
          logEvent(`${family.name} attacked your empire! Lost $${damage} and some reputation.`);
        } else if (action < 0.7) {
          // Improve their power
          family.power += 5;
          logEvent(`${family.name} has grown stronger.`);
        } else {
          // Attempt to improve relationship
          family.relationship += 5;
          logEvent(`${family.name} has shown interest in improving relations.`);
        }
      }
    });
  }

  function buyNewBusiness() {
    if (money >= 8000 && influence >= 10) {
      const newBusiness = gameLogic.generateNewBusiness(playerName, businesses);
      if (newBusiness) {
        money -= 8000;
        influence -= 10;
        businesses = [...businesses, newBusiness];
        logEvent(`Acquired a new ${newBusiness.type} business: ${newBusiness.name}`);
      } else {
        logEvent("No new business types available to purchase.");
      }
    }
  }

  function launderMoney() {
    if (selectedBusiness && selectedBusiness.type === 'laundromat') {
      const amount = Math.min(money, 10000);
      money += Math.floor(amount * 0.1);
      reputation += 2;
      logEvent(`Laundered $${amount} through ${selectedBusiness.name}, gained ${Math.floor(amount * 0.1)} in clean money`);
    }
  }

  function hostParty() {
    if (selectedBusiness && (selectedBusiness.type === 'nightclub' || selectedBusiness.type === 'casino')) {
      const cost = 5000;
      if (money >= cost) {
        money -= cost;
        reputation += 10;
        influence += 5;
        logEvent(`Hosted a lavish party at ${selectedBusiness.name}, increasing reputation and influence`);
      }
    }
  }

  function intimidateRivals() {
    if (influence >= 15) {
      influence -= 15;
      rivalFamilies.forEach(family => {
        family.power -= 5;
        family.relationship -= 10;
      });
      reputation += 5;
      logEvent('Intimidated rival families, decreasing their power but worsening relationships');
    }
  }
</script>

{#if browser && mounted}
  {#if !gameStarted}
    <div class="card max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Welcome to Mafia Empire</h2>
      <input
        type="text"
        bind:value={playerName}
        placeholder="Enter your name, Boss"
        class="w-full p-2 mb-4 bg-gray-700 rounded"
      />
      <button on:click={startGame} class="btn btn-primary w-full">Start Your Empire</button>
    </div>
  {:else if gameOver}
    <div class="card max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-4">Game Over</h2>
      <p>Your empire has fallen after {day} days.</p>
      <button on:click={() => window.location.reload()} class="btn btn-primary w-full mt-4">Start New Game</button>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Your Empire</h2>
        <p>Boss: {playerName}</p>
        <p>Day: {day}</p>
        <p>Money: ${money}</p>
        <p>Reputation: {reputation}</p>
        <p>Influence: {influence}</p>
        <p>Police Attention: {policeAttention}%</p>
        <div class="mt-4 space-y-2">
          <button on:click={bribePolice} class="btn btn-secondary w-full" disabled={money < 5000}>Bribe Police ($5000)</button>
          <button on:click={negotiateWithRivals} class="btn btn-secondary w-full" disabled={influence < 10}>Negotiate with Rivals (10 Influence)</button>
          <button on:click={expandTerritory} class="btn btn-primary w-full" disabled={money < 10000 || influence < 20}>Expand Territory ($10000, 20 Influence)</button>
          <button on:click={buyNewBusiness} class="btn btn-primary w-full" disabled={money < 8000 || influence < 10}>Buy New Business ($8000, 10 Influence)</button>
          <button on:click={intimidateRivals} class="btn btn-secondary w-full" disabled={influence < 15}>Intimidate Rivals (15 Influence)</button>
        </div>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-4">Your Businesses ({businesses.length})</h2>
        <ul class="max-h-60 overflow-y-auto">
          {#each businesses as business}
            <li
              class="mb-2 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 {selectedBusiness === business ? 'border-2 border-yellow-500' : ''}"
              on:click={() => selectBusiness(business)}
            >
              {business.name} (Level {business.level})
            </li>
          {/each}
        </ul>
      </div>

      <div class="card">
        {#if selectedBusiness}
          <h2 class="text-xl font-bold mb-4">{selectedBusiness.name}</h2>
          <p>Type: {selectedBusiness.type}</p>
          <p>Level: {selectedBusiness.level}</p>
          <p>Staff: {selectedBusiness.staff}</p>
          <p>Security: {selectedBusiness.security}</p>
          <p>Legal Income: ${selectedBusiness.legalIncome}</p>
          <p>Illegal Income: ${selectedBusiness.illegalIncome}</p>
          <p>Risk: {selectedBusiness.risk}%</p>
          <div class="mt-4 space-y-2">
            <button on:click={() => collectIncome('legal')} class="btn btn-secondary w-full">Collect Legal Income</button>
            <button on:click={() => collectIncome('illegal')} class="btn btn-primary w-full">Collect Illegal Income</button>
            <button on:click={upgradeBusiness} class="btn btn-secondary w-full" disabled={money < 5000}>Upgrade Business ($5000)</button>
            <button on:click={hireStaff} class="btn btn-secondary w-full" disabled={money < 1000}>Hire Staff ($1000)</button>
            <button on:click={improveSecurity} class="btn btn-secondary w-full" disabled={money < 2000}>Improve Security ($2000)</button>
            {#if selectedBusiness.type === 'laundromat'}
              <button on:click={launderMoney} class="btn btn-secondary w-full">Launder Money</button>
            {/if}
            {#if selectedBusiness.type === 'nightclub' || selectedBusiness.type === 'casino'}
              <button on:click={hostParty} class="btn btn-secondary w-full" disabled={money < 5000}>Host Party ($5000)</button>
            {/if}
          </div>
        {:else}
          <p>Select a business from your empire to view details and perform actions.</p>
        {/if}
      </div>
    </div>

    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="card">
        <h2 class="text-xl font-bold mb-4">Event Log</h2>
        <ul class="space-y-2">
          {#each eventLog as event}
            <li>{event}</li>
          {/each}
        </ul>
      </div>

      <div class="card">
        <h2 class="text-xl font-bold mb-4">Rival Families</h2>
        <ul class="space-y-4">
          {#each rivalFamilies as family}
            <li>
              <h3 class="font-bold">{family.name}</h3>
              <p>Power: {family.power}</p>
              <p>Relationship: {family.relationship}</p>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
{:else}
  <p>Loading...</p>
{/if}
