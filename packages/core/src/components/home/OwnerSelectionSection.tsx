import {storefront,cacheTags} from "../../shopify";
import {resolveOwnerSelection} from "../../ownerSelection";
import {OwnerSelectionView} from "./OwnerSelectionView";
export async function OwnerSelectionSection(){
 const products=await resolveOwnerSelection((query,variables)=>storefront("arvoalux",query,variables,{revalidate:60,tags:[cacheTags.brand("arvoalux"),cacheTags.product(variables.handle)]}));
 return <OwnerSelectionView products={products}/>;
}
