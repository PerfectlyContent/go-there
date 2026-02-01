import partnerBonus from './bonusQuestions_partner';
import friendBonus from './bonusQuestions_friend';
import { groupBonus, parentBonus } from './bonusQuestions_group_parent';
import { siblingBonus, kidBonus, dateBonus } from './bonusQuestions_sibling_kid_date';

const bonusQuestions = {
  partner: partnerBonus,
  friend: friendBonus,
  group: groupBonus,
  parent: parentBonus,
  sibling: siblingBonus,
  kid: kidBonus,
  date: dateBonus,
};

export default bonusQuestions;
