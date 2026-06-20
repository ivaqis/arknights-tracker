<script>
  import { createEventDispatcher } from "svelte";
  import { t } from "$lib/i18n.js";
  import Modal from "./Modal.svelte";
  import Button from "$lib/components/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let isOpen = false;

  const dispatch = createEventDispatcher();
</script>

<Modal {isOpen} on:close={() => dispatch("close")}>
  <div
    class="bg-white dark:bg-[#383838] dark:border-[#444444] rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl relative cursor-default"
  >
    <button
      class="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors cursor-pointer"
      on:click={() => dispatch("close")}
      aria-label="Close"
    >
      <Icon name="close" class="w-6 h-6" />
    </button>

    <h2
      class="font-sdk dark:text-[#FDFDFD] text-2xl font-bold text-[#21272C] mb-2 text-center"
    >
      {$t("settings.donate.title")}
    </h2>

    <p
      class="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center leading-relaxed"
    >
      {$t("settings.donate.description")}
    </p>

    <div class="flex flex-col gap-3">
      <a
        href="https://boosty.to/ivawa/donate"
        target="_blank"
        rel="noreferrer"
        class="no-underline block"
      >
        <Button variant="black2" className="w-full justify-center">
          <div slot="icon">
            <Icon name="boosty" class="w-7 h-7" />
          </div>
          Boosty
        </Button>
      </a>
      <a
        href="https://t.me/tribute/app?startapp=dFlw"
        target="_blank"
        rel="noreferrer"
        class="no-underline block"
      >
        <Button variant="black2" className="w-full justify-center">
          <div slot="icon">
            <Icon name="tribute" class="w-7 h-7" />
          </div>
          Tribute
        </Button>
      </a>
      <a
        href="https://patreon.com/ivawa?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"
        target="_blank"
        rel="noreferrer"
        class="no-underline block"
      >
        <Button variant="black2" className="w-full justify-center">
          <div slot="icon">
            <Icon name="patreon" class="w-7 h-7" />
          </div>
          Patreon
        </Button>
      </a>
    </div>
  </div>
</Modal>
