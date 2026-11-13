import { prisma } from "../src/server/db/client";

async function seedRichBlogs() {
  console.log("Updating blogs with rich editorial road trip content...");

  const richTripContent = `Delhi NCR sits at the crossroads of some of India's finest expressways and national highway corridors. Within a 3.5 to 6-hour self-drive, you can transition from high-rise office towers to quiet pine-scented Himalayan ridges or royal desert palaces.

Whether you are packing an Innova Crysta for a family weekend or cruising behind the wheel of a Mahindra Thar 4x4, here are the top 7 weekend road trips from Delhi NCR designed specifically for 3-day getaways.

---

### 1. Jaipur: The Pink City via Delhi-Mumbai Expressway (NE4)
- **Driving Time:** 3.5 - 4 Hours | **Distance:** 270 KM
- **Recommended PrimeRides Car:** Luxury Sedan or Fortuner 4x4
- **Expressway Highlights:** The newly opened Sohna-Dausa stretch of the Delhi-Mumbai Expressway has cut driving time by more than half. Smooth tarmac, dedicated rest areas, and electric charging bays make this a world-class sprint.
- **Weekend Itinerary:** Check in to a heritage Haveli in Bani Park or Amer, explore Nahargarh Fort at sunset, sample traditional Dal Baati Churma, and tour the City Palace before a leisurely Sunday afternoon cruise back to Delhi.

### 2. Lansdowne: The Quiet Pine Haven of Uttarakhand
- **Driving Time:** 5.5 - 6 Hours | **Distance:** 250 KM via Meerut Expressway & Kotdwar
- **Recommended PrimeRides Car:** Mahindra Thar 4x4 or Hyundai Creta
- **The Drive:** Breezy Meerut Expressway followed by gentle winding ascents from Kotdwar through cantonment oak forests.
- **Key Attractions:** Bhulla Tal Lake, Tip-in-Top viewpoint, and peaceful St. Mary’s Church. Lansdowne remains remarkably free from commercial hustle, making it the ideal antidote to city fatigue.

### 3. Kasauli: Colonial Charm & Himalayan Vistas
- **Driving Time:** 5.5 Hours | **Distance:** 290 KM via Eastern Peripheral & NH44
- **Recommended PrimeRides Car:** Toyota Innova Crysta (Automatic)
- **Highway Pitstops:** Stop for legendary stuffed parathas at Murthal (Amrik Sukhdev or Mannat Haveli) before crossing Panipat and Kurukshetra into the Himalayan foothills.
- **Top Highlights:** Sunset Point, Gilbert Nature Trail walk, and evening coffee on Heritage Mall Road.

### 4. Neemrana: The 15th-Century Fortress Escape
- **Driving Time:** 2.5 Hours | **Distance:** 120 KM via NH48 (Delhi-Jaipur Highway)
- **Recommended PrimeRides Car:** Maruti Baleno or Premium Sedan
- **Quick Friday Getaway:** Just across the Haryana-Rajasthan border, Neemrana Fort-Palace is one of India's oldest heritage resorts. Experience zip-lining between bastions, vintage car rides, and candlelit courtyard dinners without tiring out the driver.

### 5. Rishikesh & Shivpuri: River Rapids & Himalayan Foothills
- **Driving Time:** 4.5 Hours | **Distance:** 240 KM via Upper Ganga Canal Road & Meerut Expressway
- **Recommended PrimeRides Car:** Mahindra Thar 4x4 or Fortuner SUV
- **Adventure Itinerary:** White water rafting on the Ganges, cliff jumping at Shivpuri, evening Ganga Aarti at Parmarth Niketan, and organic cafe culture along Laxman Jhula.

### 6. Sariska Tiger Reserve & Alwar: Wilderness & Haunted Ruins
- **Driving Time:** 4 Hours | **Distance:** 200 KM via Delhi-Mumbai Expressway & Alwar exit
- **Recommended PrimeRides Car:** Mahindra Thar 4x4 or 7-Seater SUV
- **Wildlife & Mystery:** Early morning jungle safari in the dry deciduous hills of Sariska, followed by an afternoon exploration of the mysterious ruins of Bhangarh Fort and Siliserh Lake Palace.

### 7. Pangot & Kilbury Bird Sanctuary: The Hidden Lake District
- **Driving Time:** 6.5 Hours | **Distance:** 310 KM via Moradabad & Kaladhungi
- **Recommended PrimeRides Car:** Toyota Fortuner 4x4 or Innova Hycross
- **The Hidden Trail:** Located 15 KM past crowded Nainital, Pangot is home to over 580 Himalayan bird species, dense rhododendron canopies, and cozy mountain lodges with snow-peak views of Nanda Devi.

---

### PrimeRides Pre-Trip Checklist
1. **Tyre Pressure & Alignment:** High-speed expressway runs cause heat expansion. Ensure cold tyre PSI is calibrated at 32-35 PSI before departure.
2. **FASTag Auto-Debit:** Every PrimeRides car includes an active FASTag so you breeze through expressway barriers without queues.
3. **Download Offline Maps:** Mountain areas near Kotdwar and Pangot experience cellular blind spots. Always save your route on Google Maps offline before entering the ghats.`;

  await prisma.blog.update({
    where: { slug: "top-7-weekend-road-trips-from-delhi-ncr" },
    data: {
      content: richTripContent,
      read_time: "6 min read",
      author_name: "Vikram Malhotra (Travel Desk Lead)",
      summary: "From Jaipur's royal forts via the 8-lane expressway to the quiet pine peaks of Lansdowne and Pangot, discover 7 scenic self-drive road trips you can complete in 3 days.",
    },
  });

  console.log("Updated blog #2 successfully!");
}

seedRichBlogs()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
