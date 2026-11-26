# NPC Field Key

CCES Inc. internal field tool. It is not a public product and not endorsed by the MN DNR.

A mobile web app (PWA) for keying Minnesota native plant communities in the field. It is based on the MN DNR *Field Guide to the Native Plant Communities of Minnesota* (Laurentian Mixed Forest, Eastern Broadleaf Forest, and Prairie Parkland & Tallgrass Aspen Parklands provinces). Species names follow the MNTaxa 2026 checklist.

**Install:** open the site in Chrome on Android, then tap the ⋮ menu and choose **Add to Home screen / Install app**. After the first load it works offline.

**Keying order (follows the DNR guides' "Instructions for Keys"):**
1. **Site**: GPS sets the ECS section, subsection and LTA.
2. **Key 1**: wooded or open, upland or wetland. This picks the DNR system key (A–D).
3. **Canopy / Subcanopy / Shrub / Ground**: species with cover classes.
4. **System**: the DNR system-key panel side by side. Each system gets a probability built from three things:
   - the panel's indicator plants and their cover;
   - the landform, soil and field statements you mark ✓ or ✗;
   - the guide's appendix table of system frequencies (LMF and EBF Appendices B and C, PPATP Appendices B to E).

   You choose the system.
5. **Class**: runs the chosen system's class key, which is the verdict. Class probabilities within that system (from the DNR frequency tables and distribution maps) are shown beside it as support. Classes from the other systems are weighed as the system probability times the class's share within that system. The fact-sheet similar-class indicator tables are shown for checking. Then come types, subtypes and FQI.

The "Possible NPCs here" card and the 20-species lists use the same system probabilities, or only the chosen system's classes once you choose one.

Data entered stays on the device until **Reset plot** is pressed.

When you change any file, bump `CACHE` in `sw.js` so installed copies update.
