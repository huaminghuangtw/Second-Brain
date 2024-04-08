- [比較]

  - iOS: Apple's Shortcuts
  - Android: Google's Action Blocks

- Actions

  - "Reveal Action" & "Quick Look"
  - "Take Screenshot" + "Extract Text from Image" (for OCR)
  - Get Dictionary Value → Options: "Value", "**All Keys**", "**All Values**"
  - Get "Item" from List → Options: "First Item", "Last Item", \*"Random Item", "Item at Index", "Items in Range"
    - \*Get random items from List
      - Single: "Get Item from List" → Choose "Random Item"
      - Multiple: "Filter Files" → Choose "Random" in "Sort by" → Enable "Limit" → Select the number of random items you want to get
  - "Is Charging" v.s "Is Connected to Charger"
    - Former: Is the device gaining battery charge?
    - Latter: Is the device connected to a charger that at least is slowing down the rate the battery drains?
      - For Optimized Battery Charging: being connected to a charger but not charging
  - "Add to Variable" -> List
  - How to use Boolean variables?
    - Method I: Type = Boolean -> `If "myBooleanVar"`
    - Method II: Type = Text -> `If "myBooleanVar" is Yes/No`
  - "Run Script over SSH"
  - "Get Contents of URL" -> make webhook calls
  - "Open X-Callback URL" (= URL Scheme)
    - Allow you to go beyond "Open App" in Shortcuts
    - They are helpful in the Shortcuts app when the App itself doesn't have any Shortcut Actions support available by default
    - **Tip:** If you’d like to run one shortcut from another shortcut, use the `Run Shortcut` action instead of a URL scheme. You should only run shortcuts with a URL if you're integrating from another app outside of Shortcuts
  - "Get Weather Forecast" (<-> "Get Current Weather")
	- Hourly: grabs results for the next 24 hours (A list containing 24 items)
	- Daily: grabs results for the next 10 days (A list containing 10 items)

- Troubleshooting Tips
  - Magic variables
  - Time limitation: a running shortcut will only stay active for a short period of time (around 3 mins) when you are away from the Shortcuts application
  - 如何透過 Siri 呼叫 “Ask for Input” (not just “Dictate Text”) 指令? Add “Dismiss Siri and Continue" in the very beginning
