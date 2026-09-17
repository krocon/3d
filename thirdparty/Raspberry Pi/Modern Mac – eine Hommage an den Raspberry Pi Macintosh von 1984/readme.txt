Modern Mac – eine Hommage an den Raspberry Pi Macintosh von 1984

https://makerworld.com/de/models/1536989-modern-mac-a-raspberry-pi-1984-macintosh-homage#profileId-1612487

### What's old is new again!

### Background

Bambu Lab sponsored my YouTube channel, Snazzy Labs, to showcase the new H2D and H2D Laser. I quickly found that few projects online supported such a large print volume, so I set out to create a near full-size reproduction of the 1984 Apple Macintosh—with an even larger display than the original but while maintaining the same aspect ratio! Instead of leaving a cavernous, empty shell, I redesigned the part with a cantilevered display and a slimmed-down profile. After sharing teaser images on Twitter, I discovered that viewer Jerrod H. had developed a similar design for another project! Regardless, my goal was to create something modern and beautiful while honoring the retro roots of the original.

 

Check out my video to see my goals for the project, the print process, and the build itself!

### Needed Materials

* The print files linked on this page (obviously)
* Raspberry Pi 3B+ (if you intend to run Basilisk II and other classic Mac OS emulators)
* This 10.5&#34; 3:2 portable LCD that appears on Amazon under a bunch of generic resellers
* 180-degree mini HDMI to full-size HDMI adapter for the display cable
* Right angle USB-C cable to power the display
* A whole lot of filament (colors/quantities linked on this project page)
* M2.5x4x4mm heatset inserts and corresponding 6mm screws (linked in the materials section) for your Pi
* An H2D and/or H2D Laser (though, I'd love for somebody to remix the project to fit 256^3 printers too!)
Boost MeFor every boost, Steve Jobs rolls over in his grave.

### Resources

* MacintoshPi is an excellent way to install classic Mac OS (and needed dependencies) with a single command—but note, is not compatible with the Pi 4 or later
* Etcher is the easiest way to provision your Pi's SD card with the proper Buster image
* BMOW Wombat if you want to use an ADB keyboard

### Print Recommendations

* Print the Main Body horizontally on the bed

* the model has a slight taper on the display to match the original, 1984 Macintosh making it impossible to print face down
* use tree supports from the build plate only to reduce scarring on the part but ensure that it places them where the display bezel is supported—default BambuSlicer settings will not place them there and if you're not paying attention, you'll waste 1.5kg of filament
* it is recommended to print this part with a 0.8mm nozzle—not just to cut print time in half, but also to reduce z-banding at higher print speeds

* The Six Colors Apple logo requires two AMS units

* I tried to come up with clever ways to use just one, but for how small the part is, it just isn't feasible
* ironing the top layer really helps bring some shine to the logo itself
* our video shows a 0.2mm nozzle printing this part, but we also printed it in 0.4mm and the differences are minimal—still looks great

* The Pi Tray requires the H2D's dual-nozzle setup

* using an AMS to load/unload/purge TPU isn't fun (even with Bambu Lab's TPU formulated for AMS)
* it's worth putting a little glue stick where the TPU will touch the textured PEI bed to ensure that it releases from the build plate easily without warping the otherwise thin PLA I/O shield
* enable tree supports from the build plate to support the Pi standoff posts (the bases hide inside the USB/Ethernet I/O holes perfectly)
* use a soldering iron to insert the brass standoffs listed on this page

### Boost, Share, and Remix!

The vast majority of retro-reproduction Macintosh projects die on the vine due to poor documentation and improper support. This is just the start: and I'm hoping that this can become a much wider in scope—with people making remixes using different displays, modified sizes for smaller printers, different accessory drawers for other SFF PCs, battery-powered alternatives, and more!

 

The best way you can do this is to boost, like, and share this project everywhere you can!  Thank you so much, and stay snazzy!

Boost MeLet's bring attention to this project so smarter minds than mine can come up with amazing remixes.

Druckeinstellungen:
- Druckprofil: 0.08mm layer, 2 walls, 15% infill
- Schichthöhe: 0.08 mm
- Wandlinien: 2
- Infill: 15%
- Filament: PLA (#E8DBB7), PLA (#FF6A13), PLA (#AE96D4), PLA (#00B1B7), PLA (#C12E1F), PLA (#F4EE2A), PLA (#61C680), TPU (#000000)
