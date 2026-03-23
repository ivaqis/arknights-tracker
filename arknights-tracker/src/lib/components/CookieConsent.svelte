<script>
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import Button from "./Button.svelte";
  import { t } from "$lib/i18n";

  let showBanner = false;

  onMount(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setTimeout(() => {
        showBanner = true;
      }, 1000);
    }
  });

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    showBanner = false;
    // ТУТ можно инициализировать Google Analytics, если она есть
    // initAnalytics(); 
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    showBanner = false;
  }
</script>

{#if showBanner}
  <div
    transition:fly={{ y: 50, duration: 300 }}
    class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-[100] p-5 bg-white dark:bg-[#2A2A2A] border border-gray-100 dark:border-[#444] rounded-2xl shadow-sm dark:shadow-black/50"
  >
    <div class="flex flex-col gap-4">
      <div>
        <h4 class="font-bold text-gray-900 dark:text-white mb-1">
          {$t("cookies.title") || "Cookies & Privacy"}
        </h4>
        <p class="text-sm text-gray-500 dark:text-[#B7B6B3] leading-relaxed">
          {$t("cookies.text") || "We use cookies to ensure you get the best experience on our website. We analyze traffic and store your preferences locally."}
        </p>
      </div>

      <div class="flex gap-2 justify-end">
        <Button 
          variant="round" 
          className="text-xs px-4 py-2"
          onClick={decline}
        >
          {$t("cookies.decline") || "Decline"}
        </Button>
        <Button 
          variant="round" 
          className="text-xs px-4 py-2"
          onClick={accept}
        >
          {$t("cookies.accept") || "Accept"}
        </Button>
      </div>
    </div>
  </div>
{/if}