import inquirer from 'inquirer';

export const STACK = Object.freeze({
  FRONTEND: 'frontend',
  BACKEND: 'backend',
});

const CHOICES = [
  { name: 'Frontend', value: STACK.FRONTEND },
  { name: 'Backend', value: STACK.BACKEND },
];

export async function resolveStack() {
  const { stack } = await inquirer.prompt([
    {
      type: 'list',
      name: 'stack',
      message: 'What type of project is this? (Frontend or Backend)',
      choices: CHOICES,
      default: STACK.FRONTEND,
    },
  ]);
  return stack;
}
