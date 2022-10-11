import { Args, CombatStrategy, Engine, getTasks, Quest, Task } from "grimoire-kolmafia";
import { myAdventures, visitUrl, runChoice, print } from "kolmafia";
import {
  $familiar,
  $familiars,
  $item,
  $location,
  $locations,
  $skill,
  AutumnAton,
  get,
  have,
  Macro,
} from "libram";

const args = Args.create("chroner-collector", "A script for farming chroner", {
  turns: Args.number({
    help: "The number of turns to run (use negative numbers for the number of turns remaining)",
    default: Infinity,
  }),
});

export function main(command?: string) {
  Args.fill(args, command);

  const completed = args.turns < 0 ? () => false : () => myAdventures() <= -args.turns;

  if (args.turns < 0) {
    print(`Running chrono until you have ${-args.turns} left`);
  } else {
    print(`Running chrono for ${args.turns} turns`);
  }

  const familiar = $familiars`reagnimated gnome, temporal riftlet, none`.find((f) => have(f));
  const famequip =
    familiar === $familiar`reagnimated gnome` ? $item`gnomish housemaid's kgnee` : $item`stillsuit`;


  const ttt: Quest<Task> = {
    name: "TimeTwitchingTower",
    tasks: [
      {

        name: "Autumn-Aton",
        completed: () => completed() && AutumnAton.currentlyIn() !== null,
        do: () => AutumnAton.sendTo($locations`Globe Theatre Main Stage, The Dire Warren`),
        ready: () => AutumnAton.available(),
      },
      {
        name: "Kgnee",
        completed: () =>
          !have($familiar`Reagnimated Gnome`) || have($item`gnomish housemaid's kgnee`),
        do: (): void => {
          visitUrl("arena.php");
          runChoice(4);
        },
        outfit: { familiar: $familiar`Reagnimated Gnome` },
      },
      {
        name: "Chroner",
        completed,
        do: $location`Globe Theatre Main Stage`,
        outfit: () => {
          return {
            weapon: $item`June cleaver`,
            offhand: $item`carnivorous potted plant`,
            acc1: $item`mafia thumb ring`,
            acc2: $item`time-twitching toolbelt`,
            acc3: $item`lucky gold ring`,
            familiar,
            famequip,
          };
        },
        combat: new CombatStrategy().macro(
          Macro.externalIf(
            get("cosmicBowlingBallReturnCombats") < 1,
            Macro.trySkill($skill`Bowl Straight Up`)
          )
            .trySkill($skill`Sing Along`)
            .trySkill($skill`Extract`)
            .attack()
            .repeat()
        ),
      },
    ],
  };

  const engine = new Engine(getTasks([ttt]));
  const actions = args.turns > 0 ? args.turns : Infinity;

  engine.run(actions);
}
