/**
 * Hand-authored opening paragraphs for the 42 herbal-medicine PUBLISHED
 * tutorials, per voice-spec-2026-05-21.md section 3.2 (Herbal medicine
 * remedy) and 3.x (Herb profile).
 *
 * Each opening replaces the FIRST paragraph of the tutorial's body. The
 * rest of the body is left intact — qc-fix's clinical-vocab swaps + the
 * deterministic sweeps handle the body register.
 *
 * Pattern (REMEDY):
 *   [Name the preparation: what it is, what it's made of.]
 *   [State factually what tradition has used it for.]
 *   [One sentence on what to expect: texture, taste, yield, time.]
 *
 * Pattern (HERB_PROFILE):
 *   [Plant in the home kitchen — what the dried herb does, how it's
 *    brewed, what to do with it.]
 *   [State what tradition has used it for.]
 *   [Storage / yield / a practical anchor.]
 *
 * Pattern (READING):
 *   [The question the reading answers, in plain English.]
 *   [What the reading covers + why it matters.]
 *   [Practical anchor.]
 */

export const OPENINGS: Record<string, string> = {
  'calendula-compress-for-minor-wounds':
    "A cold calendula brew used to soak a muslin cloth and held against a minor cut, graze, or slow-healing scratch. The infused water carries the herb's wound-soothing action onto the skin without rubbing or stinging. Twenty-five minutes' work, most of it the brewing, and one pot makes enough for two or three compresses.",

  'calendula-infused-oil':
    "Dried calendula flowers steeped in extra-virgin olive oil to draw out the golden colour and the herb's wound-soothing action. The household's base for salves, balms, and a direct rub on dry patches or rough hands. Two ways to make it: warm on a stovetop in an afternoon, or sun-steeped on a windowsill for four to six weeks. The finished oil makes about 180 ml, enough for three or four small salve tins.",

  'calendula-salve-for-skin':
    "Calendula salve is a soft golden balm made from dried calendula flowers steeped in olive oil, then set with a little beeswax. A kitchen tradition long made for closed minor cuts, grazes, dry patches, and rough hands. About fifteen minutes of active work spread over an afternoon; the finished tin keeps a year in a cool cupboard.",

  'chamomile-eye-compress':
    "A cooled chamomile brew soaked into a clean cloth and held over closed eyes for five minutes. The skin around the eyes is thin and easily reached by what is on the cloth, and chamomile calms puffiness and soothes the itch. Long taken for tired screen-time eyes, a poor night's puff, or a mildly itchy reaction to pollen. About 35 minutes start to compress, enough for one session.",

  'chamomile-infusion-for-colic':
    "A cup of chamomile after a meal that has left the stomach cramping. The herb relaxes the smooth muscle in the gut, easing the squeezing that follows a heavy or gassy meal. Two teaspoons of dried flowers in a lidded pot, just-off-boil water, lid on for ten minutes. Twelve minutes' work for one cup.",

  'chamomile-infusion-for-tension-headache':
    "A cup of chamomile for a tension headache at the end of a stressful day, the dull squeezing pain across the forehead and round the back of the head. Chamomile's muscle-easing action works on the gut and on the body's other muscles, including the tight scalp and neck muscles that drive the headache. The brew is the standard two teaspoons in a covered pot for ten minutes. Twelve minutes' work for one cup.",

  'chamomile-profile':
    "Chamomile in the home kitchen, what the dried flowers do, how to brew them properly, and what to do with them beyond the evening cup. The most-used herb of the European home cupboard, long taken for a wound-up day, a cramping gut, or a sore eye. A jar of dried flowers keeps a year in the kitchen cupboard and makes about thirty cups of strong brew.",

  'chamomile-sleep-bath':
    "A strong chamomile brew poured into a warm evening bath. The cup works from the inside; the bath works through the warm steam and the skin. Long taken for restless evenings and trouble unwinding before bed. About twenty minutes' work plus the bath itself; one batch is one bath.",

  'echinacea-tincture':
    "Dried echinacea root soaked in 40% vodka for four to six weeks, then taken by the dropper at the first sign of a cold. The alcohol draws out the herb's immune-supporting compounds far better than hot water can. About fifteen minutes of active work spread across the six weeks; the finished 200 ml bottle gives 50 to 100 short-course doses.",

  'elderberry-and-ginger-decoction':
    "Dried elderberries and fresh ginger simmered together in water for half an hour, then strained and sipped hot. Berries are too tough for a simple steep, and the long simmer breaks them down and makes the brew safe to drink. Long taken in the first days of a cold or flu. About 45 minutes' work, and the pot makes three or four hot cups.",

  'elderberry-profile':
    "The black-purple berries of the European elder, dried and kept for the cold-and-flu months. Always cooked, raw elderberries are not for eating. The home kitchen meets them as a winter brew, a syrup for the cupboard, or stirred into a warming drink. A jar of dried berries keeps a year and makes about ten batches of syrup.",

  'elderberry-syrup':
    "A dark, spiced syrup of dried elderberries simmered with cloves and cinnamon, then stirred into raw honey with a splash of brandy. Long taken by the teaspoon at the first sign of a winter cold. Always cook the berries, raw Sambucus nigra is not for eating. About an hour's work, and the bottle makes about 350 ml of syrup, enough for thirty-five adult doses.",

  'elderflower-cold-infusion':
    "A cup of dried elderflowers steeped in just-boiled water, taken at the first sign of a cold. The brew gently opens the sinuses and brings on a light sweat, easing the blocked, feverish stage of a cold. Twelve minutes' work for a single dose; brew fresh for each cup.",

  'elderflower-skin-wash':
    "A cooled elderflower brew used as a gentle wash for dry, sensitive, or mildly irritated skin. Long used in European households as an everyday face wash, fragrant, soft, and unlikely to upset anyone's skin. About 18 minutes' work, and the pot makes around 200 ml of wash, enough for one or two sessions.",

  'fennel-infusion-for-menstrual-cramps':
    "A cup of fennel seed tea for period cramps. Fennel's muscle-easing action works in the gut and also in the womb muscle, calming the squeezing that drives the worst of the cramping. The brew is the same as the digestive cup: a teaspoon of lightly crushed seeds in a lidded pot, steeped covered for ten minutes. Twelve minutes' work for a single cup, drunk slowly at the first sign of cramping.",

  'fennel-seed-tea':
    "A cup of crushed fennel seeds steeped in just-boiled water, taken after a heavy or gassy meal. The brew eases the wind and bloating that follow a big meal, the same seeds that flavour bread and sausages doing the work. Twelve minutes' work for a single cup; a jar of seeds from the spice rack makes dozens of brews.",

  'garlic-honey-for-cold':
    "Crushed raw garlic left to steep in raw honey for 24 hours. The honey draws out the working compounds from the garlic, softens the harshness, and keeps the preparation good in the cupboard for months. Long taken by the teaspoon at the start of a cold, or stirred into a hot lemon mug. About a day's wait but only five minutes of work; one jar makes 250 ml, twenty to twenty-five doses.",

  'garlic-infusion-for-colds':
    "Three crushed cloves of garlic simmered in water for ten minutes, strained, and drunk hot with lemon. The heat softens the raw garlic edge so the brew goes down without burning, while keeping the working sulphur compounds in the cup. Long taken in the first shivery days of a cold. About twenty minutes' work for a single cup.",

  'ginger-compress-for-muscle-ache':
    "A strong ginger root brew applied as a hot compress to an area of sore muscle or mild joint pain. The ginger drives heat into the tissues, lifts local circulation, and eases stiffness. Long used in Japanese and European households for muscle aches that don't want a hot bath. About twenty minutes' work; one pot is enough for a single compress session.",

  'ginger-infusion-for-nausea':
    "A cup of fresh ginger steeped in hot water, for nausea on a journey, queasiness after a rich meal, or an unsettled stomach in cold weather. Long used in kitchens across the world as the first response to a turning stomach. Fifteen minutes' work for a single cup.",

  'ginger-profile':
    "Ginger root in the home kitchen, what the rhizome does, how to brew it for nausea or a cold, and the dose ranges for a tea, a compress, or a bath. The most useful kitchen herb of any in the cupboard, present in every spice rack and the most-studied herb in modern research. A small piece of fresh root makes several brews; the powdered ginger from the spice jar works just as well in a bath or compress.",

  'ginger-warming-bath':
    "A strong ginger brew poured into a warm bath. The ginger compounds draw blood to the surface, warming the muscles and joints through. Long used in folk traditions for cold, stiff muscles, hard physical days, and the bone-deep cold of winter damp. Twenty minutes' work for one bath.",

  'how-herbal-infusions-work':
    "What actually happens when you pour hot water onto a herb. Why the lid matters more than the steep time, why some herbs want cold water instead, and why a steeped brew is different from a simmered one. The practical foundations behind every hot brew in this section. About ten minutes' read for a year of better cups.",

  'lavender-bath-for-restlessness':
    "A strong lavender brew poured into the evening bath. The aromatic oils carry into the steam and into the skin, both routes leading to the same nervous-system unwinding. Long made for restless evenings and broken sleep. Twenty minutes' work; the bath itself takes 20 to 30 minutes more.",

  'lavender-compress-for-insect-bites':
    "A cooled lavender brew applied as a compress to a fresh insect bite or mild sting. The cool cloth eases the itch on contact and calms the swelling. Long used in households for bites and stings, recorded in herbals for centuries. About 25 minutes' work; one pot is enough for a single session.",

  'lavender-infusion-for-mild-low-mood':
    "A cup of dried lavender flowers steeped in just-boiled water, taken for a moment of mild, situational low mood. Long used as a supportive evening drink when the day has felt flat. Twelve minutes' work for one cup. Supportive only, not a treatment for depression.",

  'lavender-profile':
    "Lavender in the home kitchen, what the dried flowers do, how to brew them for a cup or a bath, and the usual doses for the nervous system, the skin, and the muscles. The most versatile aromatic herb of the European cupboard, used in households from Hildegard onwards. A jar of dried flowers keeps a year and makes dozens of cups, baths, or compresses.",

  'lavender-salt-bath-for-muscle-tension':
    "Epsom salts dissolved in a warm bath with a strong lavender brew added. The magnesium soaks into tight muscle tissue; the lavender carries through the steam and the skin to settle the nerves around the tension. Long used for muscle tension at the end of a hard day. Twenty minutes' work for one bath.",

  'lemon-balm-infusion':
    "A cup of dried lemon balm leaves steeped in just-boiled water, for mild anxiety or a busy, racing mind. One of the most pleasant-tasting nerve-calming herbs of the western tradition, a gentle lemon-and-honey flavour even with no honey added. Twelve minutes' work for one cup.",

  'marshmallow-gargle-for-sore-throat':
    "Dried marshmallow root left to steep in cold water overnight, then used as a gargle for a raw, inflamed throat. Cold water draws out the slippery coating the root is known for; heat destroys it, so this one is never hot. The liquid is thick, slightly sweet, and coats the throat on contact, easing the rub of swallowing. About eight hours of waiting but only five minutes of work; the jar gives 250 ml, enough for three or four gargles.",

  'marshmallow-root-cold-infusion':
    "Dried marshmallow root steeped in cold water overnight, then strained and sipped slowly before meals. The cold-water method is essential, heat destroys the slippery coating that is the whole point of marshmallow. The cold brew is thick, slightly sweet, and mild-tasting. Long taken for mild gut soreness, heartburn, or an irritated lining. About eight hours of waiting but only five minutes of work; the jar makes one cup.",

  'nettle-compress-for-mild-eczema':
    "A cooled nettle leaf brew applied as a compress to dry, itchy, non-weeping eczema patches. Nettle's surface action calms the inflammation and the itch on contact. Long used in households for surface skin complaints. About 25 minutes' work; one pot is enough for a single session. A supportive measure only, not a treatment for eczema.",

  'nettle-infusion-for-cycle-support':
    "A daily cup of dried nettle leaf steeped in hot water, taken through the week before menstruation. Nettle is rich in iron, calcium, and magnesium, the same minerals the cycle uses up, and has a long traditional reputation as a cycle-support herb. Twelve minutes' work for one cup, drunk daily for the week.",

  'nettle-infusion-for-hayfever':
    "A daily cup of dried nettle leaf steeped in hot water, taken through hay fever season. Nettle has a long traditional history as a calming herb for seasonal sniffing and itching, with a small body of modern evidence behind the daily-cup approach. Twelve minutes' work for one cup.",

  'nettle-profile':
    "Stinging nettle in the home kitchen, what the dried leaf does, how to brew it for a daily cup or a compress, and the safety notes for raw versus dried. The most nutritive wild herb of the British countryside, literally growing in every hedgerow. A jar of dried leaf keeps a year and makes dozens of brews.",

  'peppermint-steam-for-congestion':
    "Dried peppermint leaves in a bowl of just-boiled water, a towel over the head, five minutes breathing the steam. The menthol vapour opens the nasal passages on contact and loosens the mucus behind a blocked sinus. Long used as the kitchen's fastest decongestant. Thirteen minutes' work for one session, almost all of it the brewing.",

  'peppermint-tea-for-indigestion':
    "A cup of dried peppermint leaves steeped in just-boiled water, taken after a heavy meal. The brew eases indigestion, mild bloating, and trapped wind. Long taken as the kitchen's after-dinner cup. Ten minutes' work for one cup.",

  'pregnancy-and-herbal-medicine':
    "When natural does not mean safe, how to think about herbal preparations through the three trimesters of pregnancy. Sets out which herbs the western tradition considers safe, which need care, and which to leave alone. A practical guide to reading every other safety note in this section.",

  'st-johns-wort-profile':
    "St John's Wort in the home kitchen, the most-studied of the western kitchen herbs for mild low mood and also the most interaction-prone. A long-used herb taken for the kind of low spirits that follow a hard stretch, with a clutch of drug interactions that need a chat with the GP first. A jar of dried herb keeps a year and makes about thirty cups of brew or three small tincture bottles.",

  'thyme-cough-syrup':
    "Thyme syrup is a sweet, dark syrup of fresh thyme simmered in water and stirred into honey. A kitchen tradition long made for dry, tickly coughs and a sore chest. The thyme softens the cough; the honey coats the throat and keeps the syrup good in the fridge for about three weeks. About 40 minutes' work, mostly waiting for the thyme to simmer.",

  'valerian-tincture-for-sleep':
    "Dried valerian root soaked in 40% vodka for four to six weeks, then taken by the dropper before bed. The alcohol draws out the herb's earthy sleep compounds far better than a hot brew ever could. Long used as the strongest traditional sleep preparation in the western kitchen. About 30 minutes of work spread across six weeks; the 200 ml bottle keeps for two years.",

  'when-not-to-use-home-herbal-remedies':
    "The six situations where a home herbal remedy is the wrong tool, and what to do instead. The first article every reader in this section should read. The recipes that follow are for minor, everyday complaints, a tickly cough, a tense headache, a tired evening, a winter sniff. The article sets out where that floor stops and the rest of the medical world starts.",
}
