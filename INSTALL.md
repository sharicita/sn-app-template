# Installing Starter App

> **Starter App:** A starter ServiceNow scoped app: replace this with a one-line description of what your app does.

This guide is for anyone installing Starter App from GitHub. You don't need to be a developer. Pick the option that fits you, follow its steps, then do the [after you install](#after-you-install) steps.

---

## Which option should I use?

| Option | Best for | You need | Time |
|---|---|---|---|
| **[A. Guided setup](#option-a--guided-setup-recommended)** ⭐ | Most people | A computer with Node.js. The setup walks you through everything else. | 10 min |
| **[B. ServiceNow IDE](#option-b--servicenow-ide-no-tools-on-your-computer)** | No software on your computer | A GitHub account and admin access to the instance | 15 min |
| **[C. Update set file](#option-c--update-set-file)** | Classic ServiceNow admins, locked-down laptops | Someone who has built the package (option A or a release) | 10 min |
| **[D. Copy between your instances](#option-d--copy-it-between-your-own-instances)** | Moving an existing install to another instance | The app already installed on one instance | 10 min |

**Not sure?** Use **option A**.

> [!NOTE]
> **Which instance?** Any ServiceNow instance where you are an administrator. A free [Personal Developer Instance (PDI)](https://developer.servicenow.com/dev.do) is ideal for trying it out. On a company instance, install on a sub-production instance first and follow your change process.

---

## Option A · Guided setup (recommended)

A step-by-step page that runs on your computer. It checks your computer and saves a secure login to ServiceNow. It works out the right app scope for your instance, installs the app and tells you what to do next.

1. **Install Node.js** (version 20.18 or newer, the "LTS" download) from [nodejs.org](https://nodejs.org/). Keep the default options.
2. **Get the code.** On GitHub, select **Code → Download ZIP** and unzip it, or use `git clone <this repository's URL>`.
3. **Open a terminal in that folder.**
   - *Windows:* open the folder in File Explorer, click the address bar, type `cmd` and press Enter.
   - *Mac:* right-click the folder in Finder and select **New Terminal at Folder**.
4. **Start the setup:**

   ```bash
   npm run setup
   ```

   Your browser opens the setup page. If it doesn't, copy the address the terminal prints. Keep the terminal open until you finish.
5. **Follow the five steps on the page:**
   1. **Get ready:** installs the ServiceNow SDK into this folder, if needed (1–3 minutes).
   2. **Connect:** sign in as any **existing** account on the instance that has the **admin** role. Enter its password once. It goes to the ServiceNow SDK, which keeps it in your computer's secure credential store (Windows Credential Manager or macOS Keychain); it is never saved in the project.
   3. **Scope:** the setup suggests the right one. If the app is already installed, choose **Update**.
   4. **Install:** takes 2–5 minutes.
   5. **Next steps:** links to open the app and set it up.

**Updating later:** get the new code, then run `npm run deploy` in the same folder. It updates the same install using the profile you saved in step 3.

<details>
<summary><strong>My company uses single sign-on (SSO) or multi-factor authentication</strong></summary>

Password logins may be blocked. Ask your ServiceNow administrator for an OAuth client, then run the command below, follow its prompts, and pick the new login in step 2 of the setup:

```bash
npx now-sdk auth --add https://your-instance.service-now.com --type oauth --alias mylogin
```

</details>

<details>
<summary><strong>I prefer the command line</strong></summary>

```bash
npm ci
npx now-sdk auth --add https://your-instance.service-now.com --type basic --alias mypdi
npm run profile -- add mypdi --alias mypdi --scope x_<company code>_<app code> --instance https://your-instance.service-now.com
npm run deploy
```

Your company code is the system property `glide.appcreator.company.code`. The app code is the part of the placeholder scope after `x_` (in `now.config.json`). More detail is in [docs/install-and-deploy.md](docs/install-and-deploy.md).

</details>

---

## Option B · ServiceNow IDE (no tools on your computer)

The ServiceNow IDE can clone this project from GitHub and build it on the instance. First, give the code your instance's scope:

1. **Fork** this repository (GitHub **Fork** button). Your fork can be private.
2. **Find your company code:** in ServiceNow, open `sys_properties.list` and look up `glide.appcreator.company.code`. Your scope is `x_<company code>_<app code>`, at most 18 characters.
3. **Make a branch with your scope:** in your fork, open **Actions → Prepare a branch with my scope → Run workflow**, enter your scope and select **Run**. After about a minute you have a branch named `scope/<your scope>`. *(If Actions are disabled, enable them in your fork's **Actions** tab first.)*
4. **Connect the IDE to GitHub:** in ServiceNow, open **All → App Development → ServiceNow IDE**. Press **Ctrl+Shift+P** (Mac: **Cmd+Shift+P**) and run **Git: Set IDE Git credentials**. Enter your fork's HTTPS URL, your GitHub user name and a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens). [ServiceNow guide ↗](https://www.servicenow.com/docs/r/application-development/servicenow-ide-family-release/connect-git-provider-basic-auth.html)
5. **Clone and check out** the `scope/<your scope>` branch in the IDE, then **build and install** the app from the IDE.

> [!TIP]
> Skipping step 3 also works. The app then installs with the placeholder scope `x_starter`, and the SDK may warn that the scope doesn't match your company prefix. On personal instances that is usually fine.

---

## Option C · Update set file

Some admins prefer a classic **update set**: an XML file imported through the standard ServiceNow screens.

**Get the file:** download a package from the project's **Releases** page (it uses the placeholder scope `x_starter`), or build one for your own scope: complete option A up to step 3, then run `npm run package`. The ZIP is written to `.deploy/<profile>/target/`.

**Import it** (as an admin on the target instance):

1. Unzip the package. It contains an update set `.xml` file.
2. Open **System Update Sets → Retrieved Update Sets** and select **Import Update Set from XML**.
3. Choose the `.xml` file and select **Upload**.
4. Open the uploaded update set, select **Preview Update Set** and resolve any problems it lists.
5. Select **Commit Update Set**.

[ServiceNow: System update sets ↗](https://www.servicenow.com/docs/r/application-development/system-update-sets/system-update-sets.html)

---

## Option D · Copy it between your own instances

- **Easiest (if you have this folder):** run `npm run setup` again and choose **Install on another instance**, or add a second profile. Each instance gets its own login and profile. Choose one with `npm run deploy -- --profile <name>`.
- **Without this folder:** on the source instance, open the application record (`sys_app.list`) and use the **Publish to Update Set** related link. Then **Export to XML** and import the file on the target as in [option C](#option-c--update-set-file).

What carries over and what doesn't:

| Moves with the app | Stays behind (redo on the new instance) |
|---|---|
| Tables, roles, pages, REST API, menus, property defaults | Role assignments to users and groups |
| | Records the app stores (data, not app metadata) |
| | Changed property values |
| | API keys and other secrets (never exported) |

---

## After you install

1. **Open the app:** **All → Starter App → Home**, or go to `/<your scope>_app.do`.
2. **Give people access.** Assign `<your scope>.user` to people who use the app and `<your scope>.admin` to people who manage its settings, ideally through a group. System administrators can already use everything.
   - **Only if the Explicit Roles plugin (`com.glide.explicit_roles`) is active**, people also need `snc_internal`; without it ServiceNow treats them as external users and the app shows "External User Not Authorized". The guided setup tells you when the plugin is active.
3. **Configure it:** admins find the settings under **Starter App → Configuration → Properties**.
4. **Learn the app:** read the [user guide](docs/user-guide.md).

> [!IMPORTANT]
> **Now Assist and other ServiceNow generative AI features are not available on free Personal Developer Instances.** If the app uses AI, document an external-provider option for PDIs.

---

## Updating, uninstalling, rolling back

| I want to… | Do this |
|---|---|
| **Update** | Option A: get the new code, run `npm run deploy`. Option B: rerun the Action, pull into your branch, then build and install in the IDE. Option C: import the newer update set. |
| **Undo the last install** | Each install prints a **Rollback** link (also under **System Applications → Rollback contexts**). Open it and select **Rollback**. |
| **Remove completely** | Open the application record (**System Applications → My Company Applications**) and use **Uninstall** or **Delete**. This deletes its tables and data. Try it on a non-production instance first. |

After an update, hard-refresh the app page (**Ctrl+Shift+R**, Mac **Cmd+Shift+R**).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm` is not recognized | Node.js isn't installed or the terminal was open during the install. Reinstall Node.js, then open a **new** terminal. |
| The setup page says it has expired | Use the full address printed in the terminal (it contains a one-time key). Run `npm run setup` again if you closed it. |
| "The login could not be saved" | Check the address, user name and password. Sign in once in a browser to confirm. Wake a sleeping PDI at [developer.servicenow.com](https://developer.servicenow.com/dev.do). |
| "does not start with your instance's vendor prefix" | Use the scope the setup suggests (`x_<company code>_<app code>`). |
| "Unable to install application as application was null" | The instance has the app under a different scope ID. `npm run deploy` prints the command that points your profile at the installed app. |
| "Unable to track app install status … Forbidden" | The install was sent, but the account couldn't read its progress. The tools follow the install tracker on the instance instead and report the result. |
| "External User Not Authorized" | The Explicit Roles plugin is active and the account lacks `snc_internal`. Add the role, then sign out and back in. |
| The app loads but says you need a role | Assign `<your scope>.user` and sign out and in again. |

More: [full install and deployment reference](docs/install-and-deploy.md) · [developer setup](docs/dev-setup.md) · [all documentation](docs/README.md)
