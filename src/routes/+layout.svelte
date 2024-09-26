<script>
  import "../app.css";
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-gray-800 py-4">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold text-red-600">Mafia Empire</h1>
    </div>
  </header>

  <main class="flex-grow container mx-auto px-4 py-8">
    <slot />
  </main>

  <footer class="bg-gray-800 py-4 text-center text-sm text-gray-500">
    <p>&copy; 2023 Mafia Empire. All rights reserved.</p>
  </footer>
</div>
