[比較]
  - iOS: Apple's Shortcuts
  - Android: Google's Action Blocks

Actions
  - "Reveal Action" & "Quick Look"
  - "Take Screenshot" + "Extract Text from Image" (for OCR)
  - Get Dictionary Value &rarr; Options: "Value", "All Keys", "All Values"
	  - Often: "Choose from List" + "All Keys"
		  - **Tip:** "Choose from List" can also be used for a "Dictionary"!
			  - Get "Value" for "Chosen Item &rarr; ***Name***" from "Dictionary"
  - Get "Item" from List &rarr; Options: "First Item", "Last Item", \*"Random Item", "Item at Index", "Items in Range"
    - \*Get random items from List
      - Single: "Get Item from List" &rarr; Choose "Random Item"
      - Multiple: "Filter Files" &rarr; Choose "Random" in "Sort by" &rarr; Enable "Limit" &rarr; Select the number of random items you want to get
  - "Is Charging" v.s "Is Connected to Charger"
    - Former: Is the device gaining battery charge?
    - Latter: Is the device connected to a charger that at least is slowing down the rate the battery drains?
      - For Optimized Battery Charging: being connected to a charger but not charging
  - "Add to Variable" &rarr; List
	  - **Tip:** "Repeat with each item" + "Text" &rarr; "Repeat Results" is already a list of "Text", not need to use "Add to Variable" for each iteration &rarr; simplify code!
  - How to use Boolean variables?
    - Method I: Type = Boolean &rarr; `If "myBooleanVar"`
    - Method II: Type = Text &rarr; `If "myBooleanVar" is Yes/No`
  - ? "Run Script over SSH"
  - ? "Get Contents of URL" &rarr; make webhook calls
  - "Open X-Callback URL" (= URL Scheme)
    - Allow you to go beyond "Open App" in Shortcuts
    - They are helpful in the Shortcuts app when the App itself doesn't have any Shortcut Actions support available by default
    - **Tip:** If you'd like to run one shortcut from another shortcut, use the `Run Shortcut` action instead of a URL scheme. You should only run shortcuts with a URL if you're integrating from another app outside of Shortcuts
    - _Run Shortcut_ v.s *URL Scheme*
	    - [[iOS Tip] How the shortcuts://run-shortcut URL scheme works : r/shortcuts (reddit.com)](https://www.reddit.com/r/shortcuts/comments/y31gix/ios_tip_how_the_shortcutsrunshortcut_url_scheme/)
	    - [[iOS] Running two shortcuts at the same time : r/shortcuts (reddit.com)](https://www.reddit.com/r/shortcuts/comments/w9arji/ios_running_two_shortcuts_at_the_same_time/)
  - "Get Weather Forecast" (&harr; "Get Current Weather")
	- Hourly: grabs results for the next 24 hours (A list containing 24 items)
	- Daily: grabs results for the next 10 days (A list containing 10 items)

Troubleshooting Tips
  - Magic variables
  - Time limitation: a running shortcut will only stay active for a short period of time (around 3 mins) when you are away from the Shortcuts application
  - 如何透過 Siri 呼叫 "Ask for Input" (not just "Dictate Text") 指令? Add "Dismiss Siri and Continue" in the very beginning

About Spotify: Ask Siri to ‘play the songs or playlists u want in Spotify’ first, then it’ll automatically show the things up in shortcuts app

And make sure you turn this button off like the photo down below. In this way, you don’t need to unlock your phone to run this shortcut