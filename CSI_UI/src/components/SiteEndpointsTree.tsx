import React from 'react';
import { RuxStatus, RuxTree, RuxTreeNode } from '@astrouxds/react';
import './SiteEndpointsTree.css';

const SiteEndpointsTree: React.FC = () => {
  return (
    <div className="site-endpoints-tree">
      <h2>Site Endpoints</h2>
      <RuxTree>
	<RuxTreeNode>
		<RuxStatus slot="prefix" status="normal"></RuxStatus>
		Tree item 1
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="normal"></RuxStatus>
			Tree item 1.1
		</RuxTreeNode>
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="normal"></RuxStatus>
			Tree item 1.2
		</RuxTreeNode>
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="normal"></RuxStatus>
			Tree item 1.3
		</RuxTreeNode>
	</RuxTreeNode>
	<RuxTreeNode>
		<RuxStatus slot="prefix" status="standby"></RuxStatus>
		Tree item 2
	</RuxTreeNode>
	<RuxTreeNode>
		<RuxStatus slot="prefix" status="normal"></RuxStatus>
		Tree item 3
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="off"></RuxStatus>
			Tree item 3.1
		</RuxTreeNode>
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="critical"></RuxStatus>
			Tree item 3.2
		</RuxTreeNode>
		<RuxTreeNode slot="node">
				<RuxStatus slot="prefix" status="normal"></RuxStatus>
			Tree item 3.3
		</RuxTreeNode>
	</RuxTreeNode>
	<RuxTreeNode>
		<RuxStatus slot="prefix" status="caution"></RuxStatus>
		Tree item 4
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="caution"></RuxStatus>
				Tree item 4.1
		</RuxTreeNode>
		<RuxTreeNode slot="node">
			<RuxStatus slot="prefix" status="normal"></RuxStatus>
				Tree item 4.2
		</RuxTreeNode>
	</RuxTreeNode>
</RuxTree>
    </div>
  );
};

export default SiteEndpointsTree;